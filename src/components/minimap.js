import * as d3 from "npm:d3";
import * as htl from "npm:htl";

// #region Visual
// Describe attributes and layout.
const width = 500;
const height = 800;
const marginLeft = 20; // From this you need to subtract the radius of the root circle.
const fills = {
  selected: "#086fd3",
  unselected: "#d4d4d4",
};
const radius = {
  selected: 5,
  unselected: 3.5,
};

// Link generator.
const diagonal = d3
  .link(d3.curveStep)
  .x((d) => d.y)
  .y((d) => d.x);

// Function to determine whether a given node is an ancestor of the selected node.
const isInSelectionPath = (d) =>
  d.descendants().filter((d) => d.isSelected).length > 0;

// Function to create the tree.
const nodeSize = { height: 28, width: 20 };
const tree = d3.tree().nodeSize([nodeSize.height, nodeSize.width]);

// Function to draw the minimap visual.
function minimap(data, setState) {
  // Create the SVG element.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Create the hierarchy.
  const root = d3
    .stratify()
    .id((d) => d["id"])
    .parentId((d) => d["parent_id"])(data);

  // Group element that will contain the links.
  const gLink = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("transform", (d) => `translate(${marginLeft},${height / 2})`);

  // Group element that will contain the nodes.
  const gNode = svg
    .append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all")
    .attr("transform", (d) => `translate(${marginLeft},${height / 2})`);

  // Group element that will contain the text labels.
  const gLabel = svg
    .append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all")
    .attr("transform", (d) => `translate(${marginLeft},${height / 2})`);

  // Function to (re)draw the hierarchy.
  function update(event, source) {
    root.eachAfter((d) => {
      d.isSelected = d === source ? true : false;
      d.children = d.depth >= source.depth && d !== source ? null : d.children;
    });

    source.children = source.children ? null : source._children;

    const duration = 250;
    const nodes = root.descendants().reverse();
    const links = root.links().sort((a, b) => {
      return isInSelectionPath(a.target) === isInSelectionPath(b.target)
        ? 0
        : isInSelectionPath(a.target)
        ? 1
        : -1;
    });

    tree(root);

    const node = gNode.selectAll("circle").data(nodes, (d) => d.id);
    const link = gLink.selectAll("path").data(links, (d) => d.target.id);
    const label = gLabel.selectAll("g").data(nodes, (d) => d.id);

    const maxDepth = Math.max(...nodes.map((d) => d.depth));

    node.join(
      (enter) =>
        enter
          .append("circle")
          .attr("r", 0)
          .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
          .transition()
          .duration(duration)
          .attr("transform", (d) => `translate(${d.y},${d.x})`)
          .attr("r", (d) =>
            isInSelectionPath(d) ? radius.selected : radius.unselected
          )
          .selection()
          .attr("fill", (d) =>
            isInSelectionPath(d) ? fills.selected : fills.unselected
          )
          .on("click", (event, d) => {
            update(event, d);
            setState("selectedText", d.id);
          }),
      (update) =>
        update
          .transition()
          .duration(duration)
          .attr("transform", (d) => `translate(${d.y},${d.x})`)
          .attr("r", (d) =>
            isInSelectionPath(d) ? radius.selected : radius.unselected
          )
          .attr("fill", (d) =>
            isInSelectionPath(d) ? fills.selected : fills.unselected
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
            isInSelectionPath(d.target) ? fills.selected : fills.unselected
          )
          .selection(),
      (update) => {
        update
          .sort((a, b) => {
            return isInSelectionPath(a.target) === isInSelectionPath(b.target)
              ? 0
              : isInSelectionPath(a.target)
              ? 1
              : -1;
          })
          .attr("stroke", (d) =>
            isInSelectionPath(d.target) ? fills.selected : fills.unselected
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
          .append(function (d) {
            return hierarchyLabel(d);
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
        update.each(function (d) {
          d3.select(this)
            .select("rect")
            .attr("fill", d.isSelected ? fills.selected : fills.unselected);
        });

        update.filter((d) => d.depth !== maxDepth).remove();
      },
      (exit) => exit.remove()
    );

    // Pulse the circles.
    setTimeout(() => {
      const selectedCircles = gNode
        .selectAll("circle")
        .filter((d) => d._children);
      pulse(selectedCircles);
    }, duration + 100);

    root.eachBefore((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Initialise the hierarchy and draw the first instance.
  root.x0 = 0;
  root.y0 = 0;

  root.descendants().forEach((d) => {
    d._children = d.children;
    d.isSelected = false;
    if (d.depth < 1) d.isSelected = true;
    d.children = null;
  });

  const rootNode = root.ancestors().filter((d) => d.depth === 0)[0];
  update(null, rootNode);

  return svg.node();
}
//#endregion

// #region Hierarchy labels
// Function to create labels for the minimap hierarchy.
const hierarchyLabel = (d) => {
  const labelHeight = nodeSize.height * 0.8;
  const labelWidth = 350;
  const accentWidth = 8;
  const accentFill = d.isSelected ? "pink" : "orange";
  const fill = d.isSelected ? fills.selected : fills.unselected;

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
};
// #endregion

// #region Pulse
// Function to pulse a circle.
// Adapted from https://observablehq.com/@bumbeishvili/pulse
const pulse = (circle) => {
  (function repeat() {
    circle
      .attr("stroke", (d) =>
        isInSelectionPath(d) ? fills.selected : fills.unselected
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
  })();
};
// #endregion

export default minimap;
