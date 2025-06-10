import * as d3 from "npm:d3";
import * as htl from "npm:htl";

class Minimap {
  constructor(_data, _setState) {
    this.data = _data;
    this.setState = _setState;

    this.root = d3
      .stratify()
      .id((d) => d["id"])
      .parentId((d) => d["parent_id"])(_data);

    this.selectedNode = this.root.descendants();

    this.root.descendants().forEach((d) => {
      d._children = d.children;
      d.isSelected = false;
      if (d.depth < 1) d.isSelected = true;
      d.children = null;
    });

    // Global attributes.
    this.nodeSize = { height: 28, width: 20 };
    this.fills = {
      selected: "#086fd3",
      unselected: "#d4d4d4",
    };
    this.radius = {
      selected: 5,
      unselected: 3.5,
    };
  }

  // updateSelection() {} ?? Could this work ??

  // Function to determine whether a given node is an ancestor of the selected node.
  isInSelectionPath(d) {
    return d.descendants().filter((d) => d.isSelected).length > 0;
  }

  // Function to create labels for the minimap hierarchy.
  hierarchyLabel(d) {
    const labelHeight = this.nodeSize.height * 0.8;
    const labelWidth = 350;
    const accentWidth = 8;
    const accentFill = d.isSelected ? "pink" : "orange";
    const fill = d.isSelected ? this.fills.selected : this.fills.unselected;

    const acronym = d.data.acronym ? d.data.acronym : d.data.child_range;
    const numChars = 40;
    const label = `${acronym}: ${d.data.title}`;

    return htl.svg`<g class='minimap-labels' height=${labelHeight}  width=${labelWidth}>
    <rect x=0 y=-${
      labelHeight / 2
    } width=${accentWidth} height=${labelHeight} fill=${accentFill} rx=4 />
    <rect x=${accentWidth - 4} y=-${labelHeight / 2} width=${
      labelWidth - accentWidth
    } height=${labelHeight} fill=${fill} rx=1.5 />
    <text dx=8 dy=1 alignment-baseline=middle font-family=Inconsolata>
      ${label.length > numChars ? `${label.slice(0, numChars)} ...` : label}
    <text/>
  </g>`;
  }

  // Function to pulse a circle.
  // Adapted from https://observablehq.com/@bumbeishvili/pulse
  pulse(circle) {
    const repeat = () => {
      circle
        .attr("stroke", (d) =>
          this.isInSelectionPath(d)
            ? this.fills.selected
            : this.fills.unselected
        )
        .attr("stroke-width", 0)
        .attr("stroke-opacity", 0)
        .transition()
        .delay(100)
        .duration(800)
        .attr("stroke-width", 0)
        .attr("stroke-opacity", 0.5)
        .transition()
        .duration(2000)
        .attr("stroke-width", 25)
        .attr("stroke-opacity", 0)
        .ease(d3.easeSin)
        .on("end", repeat);
    };
    repeat();
  }

  // Function to draw the minimap visual.
  visual() {
    // Describe attributes and layout.
    const width = 500;
    const height = 800;
    const marginLeft = 20; // From this you need to subtract the radius of the this.root circle.

    // Link generator.
    const diagonal = d3
      .link(d3.curveStep)
      .x((d) => d.y)
      .y((d) => d.x);

    // Function to create the tree.
    const tree = d3
      .tree()
      .nodeSize([this.nodeSize.height, this.nodeSize.width]);

    // Create the SVG element.
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    // Group element that will contain the links.
    const gLink = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("transform", `translate(${marginLeft},${height / 2})`);

    // Group element that will contain the nodes.
    const gNode = svg
      .append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all")
      .attr("transform", `translate(${marginLeft},${height / 2})`);

    // Group element that will contain the text labels.
    const gLabel = svg
      .append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all")
      .attr("transform", `translate(${marginLeft},${height / 2})`);

    // Function to (re)draw the hierarchy.
    const update = (event, source) => {
      this.root.eachAfter((d) => {
        d.isSelected = d === source ? true : false;
        d.children =
          d.depth >= source.depth && d !== source ? null : d.children;
      });

      source.children = source.children ? null : source._children;

      const duration = 250;
      const nodes = this.root.descendants().reverse();
      const links = this.root.links().sort((a, b) => {
        return this.isInSelectionPath(a.target) ===
          this.isInSelectionPath(b.target)
          ? 0
          : this.isInSelectionPath(a.target)
          ? 1
          : -1;
      });

      tree(this.root);

      const node = gNode.selectAll("circle").data(nodes, (d) => d.id);
      const link = gLink.selectAll("path").data(links, (d) => d.target.id);
      const label = gLabel
        .selectAll(".minimap-labels")
        .data(nodes, (d) => d.id);

      const maxDepth = Math.max(...nodes.map((d) => d.depth));

      node.join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", (d) => `minimap-node-circle-${d.id}`)
            .attr("r", 0)
            .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
            .transition()
            .duration(duration)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .attr("r", (d) =>
              this.isInSelectionPath(d)
                ? this.radius.selected
                : this.radius.unselected
            )
            .selection()
            .attr("fill", (d) =>
              this.isInSelectionPath(d)
                ? this.fills.selected
                : this.fills.unselected
            )
            .on("click", (event, d) => {
              update(event, d);
              this.selectedNode = d;
              this.setState("selectedScripture", d.id);
            }),
        (update) =>
          update
            .transition()
            .duration(duration)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .attr("r", (d) =>
              this.isInSelectionPath(d)
                ? this.radius.selected
                : this.radius.unselected
            )
            .attr("fill", (d) =>
              this.isInSelectionPath(d)
                ? this.fills.selected
                : this.fills.unselected
            )
            .selection(),
        (exit) =>
          exit
            .transition()
            .duration(duration)
            .attr("transform", (d) => `translate(${d.parent.y},${d.parent.x})`)
            .attr("r", 0)
            .remove()
      );

      link.join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => {
              const o = { x: source.x0, y: source.y0 };
              return diagonal({ source: o, target: o });
            })
            .attr("stroke-opacity", 0)
            .transition()
            .duration(duration)
            .attr("stroke-opacity", 1)
            .attr("d", diagonal)
            .attr("stroke", (d) =>
              this.isInSelectionPath(d.target)
                ? this.fills.selected
                : this.fills.unselected
            )
            .selection(),
        (update) => {
          update
            .sort((a, b) => {
              return this.isInSelectionPath(a.target) ===
                this.isInSelectionPath(b.target)
                ? 0
                : this.isInSelectionPath(a.target)
                ? 1
                : -1;
            })
            .attr("stroke", (d) =>
              this.isInSelectionPath(d.target)
                ? this.fills.selected
                : this.fills.unselected
            )
            .attr("d", diagonal)
            .selection();
        },
        (exit) =>
          exit
            .transition()
            .duration(duration)
            .attr("stroke-opacity", 0)
            .remove()
            .attr("d", (d) => {
              const o = { x: d.target.parent.x, y: d.target.parent.y };
              return diagonal({ source: o, target: o });
            })
      );

      // Draw labels.
      label.join(
        (enter) => {
          enter
            .filter((d) => d.depth === maxDepth)
            .append((d) => {
              return this.hierarchyLabel(d);
            })
            .attr("transform", (d) => `translate(${d.y + 20},${d.x})`)
            .attr("opacity", 0)
            .transition()
            .duration(duration)
            .attr("opacity", 1)
            .selection()
            .on("click", (event, d) => update(event, d));
        },
        (update) => {
          // update.each((d) => {
          //   d3.select(this)
          //     .select("rect")
          //     .attr(
          //       "fill",
          //       d.isSelected ? this.fills.selected : this.fills.unselected
          //     );
          // });
          update.filter((d) => d.depth !== maxDepth).remove();
        },
        (exit) => exit.remove()
      );

      // Pulse the circles.
      setTimeout(() => {
        const selectedCircles = gNode
          .selectAll("circle")
          .filter((d) => d._children);
        this.pulse(selectedCircles);
      }, duration + 100);
      this.root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Initialise the hierarchy and draw the first instance.
    this.root.x0 = 0;
    this.root.y0 = 0;

    const rootNode = this.root.ancestors().filter((d) => d.depth === 0)[0];
    update(null, rootNode);

    return svg.node();
  }

  // Function to render the items in the current selection.
  selections() {
    const node = this.selectedNode;
    const children = this.root.descendants().filter((d) => d.id === node);
    return children;
  }
}

// const minimapVisual = visual(data, setState);
// const minimapSelections = selections(data, setState);

// return htl.html`${minimapSelections}${minimapVisual}`;

export default Minimap;
