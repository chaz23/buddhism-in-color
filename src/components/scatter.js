import * as d3 from "npm:d3";
import * as htl from "npm:htl";

class Scatterplot {
  constructor(_embeddings, _metadata, _width, _height) {
    this.width = _width;
    this.height = _height;

    // Tooltip properties.
    this.tooltipWidth = this.width * 0.5;
    this.tooltipData = null;
    this.tooltip = d3
      .select("body")
      .append(() => this.createTooltip())
      .style("display", "none");

    // Functions to fit data to screen dimensions.
    this.scale = {
      x: d3
        .scaleLinear()
        .domain([-20, 20])
        .range([this.width * 0.1, this.width * 0.9]),
      y: d3
        .scaleLinear()
        .domain([-20, 20])
        .range([this.height * 0.1, this.height * 0.9]),
      r: d3.scaleLog().domain([1, 100]).range([1, 3]),
      tooltipLeft: (rect) =>
        d3
          .scaleLinear()
          .domain([rect.left, rect.right])
          .range([rect.left, rect.right - this.tooltipWidth]),
    };

    // Data.
    this.embeddings = _embeddings.toArray();
    this.scaledPoints = this.embeddings.map((d) => [
      this.scale.x(d.x),
      this.scale.y(d.y),
    ]);
    this.metadata = _metadata.toArray();

    // Initialise zoom transform.
    this.transformPoints = (transform) =>
      this.scaledPoints.map((d) => transform.apply(d));
    this.computeDelaunay = () =>
      d3.Delaunay.from(
        this.transformedPoints,
        (d) => d[0],
        (d) => d[1]
      );
    this.transformedPoints = this.transformPoints(d3.zoomIdentity);
    this.delaunay = this.computeDelaunay();
  }

  createTooltip() {
    const tooltip = htl.html`
      <div class='scatterplot-tooltip'>
        <div class='scatterplot-tooltip-metadata-container'>
          <div>
            <span class='tooltip-title'></span>
          </div>
          <div>
            <span class='tooltip-acronym'></span>
            <span class='tooltip-reading-time'></span>
            <span class='tooltip-difficulty'></span>
            <span class='tooltip-parallel-count'></span>
          </div>
        </div>
        <hr class='tooltip-divider'>
        <div class='tooltip-section-text'></div>
      </div>`;

    d3.select(tooltip)
      .style("position", "absolute")
      .style("background", "rgba(255,255,255,0.92)")
      .style("width", "30%")
      .style("border", "1px solid #ccc")
      .style("border-radius", "0.3rem")
      .style("box-sizing", "border-box")
      .style("padding", "0.2rem 0.6rem")
      .style("pointer-events", "none");
    return tooltip;
  }

  updateTooltip(data) {
    const tooltip = this.tooltip;
    const duration = 200;

    tooltip
      .select(".tooltip-title")
      .style("opacity", 0.3)
      .style("color", "steelblue")
      .transition()
      .duration(duration)
      .style("color", "black")
      .style("opacity", 1)
      .text(data.title || "");

    tooltip
      .select(".tooltip-acronym")
      .style("opacity", 0.3)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .text(data.acronym || "");

    tooltip
      .select(".tooltip-parallel-count")
      .style("opacity", 0.3)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .text(data.parallel_count || "");

    tooltip
      .select(".tooltip-reading-time")
      .style("opacity", 0.3)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .text(data.reading_time || "");

    tooltip
      .select(".tooltip-difficulty")
      .style("opacity", 0.3)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .text(data.difficulty || "");

    tooltip
      .select(".tooltip-section-text")
      .style("opacity", 0.3)
      .transition()
      .duration(duration)
      .style("opacity", 1)
      .text(data.section_text || "");
  }

  render() {
    const dpr = window.devicePixelRatio || 1;

    const canvas = htl.html`<canvas class='embeddings-scatterplot'></canvas>`;
    const svgOverlay = htl.html`<svg style="position:absolute; top:0; left:0; width:${this.width}px; height:${this.height}px; pointer-events:none;"></svg>`;

    const ctx = canvas.getContext("2d");

    // Set internal resolution higher for high-DPI clarity.
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;

    // Keep visual display size the same.
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    ctx.scale(dpr, dpr);

    const self = this;

    let currentPointIndex = null;
    let currentTransform = d3.zoomIdentity;

    // Handle zoom events.
    d3.select(ctx.canvas).call(
      d3
        .zoom()
        .scaleExtent([1, 1000])
        .on("zoom", ({ transform }) => {
          this.transformedPoints = this.transformPoints(transform);
          this.delaunay = this.computeDelaunay();
          zoomed(transform);
        })
    );

    const defs = d3.select(svgOverlay).append("defs");

    defs
      .append("radialGradient")
      .attr("id", "fade")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#ccc", opacity: 0.2 },
        { offset: "100%", color: "#ccc", opacity: 0.7 },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)
      .attr("stop-opacity", (d) => d.opacity)
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
      .append("feDropShadow")
      .attr("dx", 0) // horizontal offset
      .attr("dy", 0) // vertical offset
      .attr("stdDeviation", 4) // blur radius
      .attr("flood-color", "black")
      .attr("flood-opacity", 0.8);

    function zoomed(transform) {
      currentTransform = transform;

      ctx.save();
      ctx.clearRect(0, 0, self.width, self.height);
      ctx.beginPath();
      const r = self.scale.r(transform.k);
      for (const [x, y] of self.transformedPoints) {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 2 * Math.PI);
      }
      ctx.fill();
      ctx.restore();

      if (currentPointIndex != null) {
        const [x, y] = self.transformedPoints[currentPointIndex];

        d3.select(svgOverlay)
          .selectAll("circle")
          .data([[x, y]])
          .join("circle")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => d[1])
          .attr("r", r + 3)
          .attr("fill", "url(#fade)")
          .attr("filter", "url(#shadow)");
      }
    }

    d3.select(ctx.canvas).on("touchmove mousemove", async (event) => {
      const rect = ctx.canvas.getBoundingClientRect();

      const posX = event.clientX - rect.left;
      const posY = event.clientY - rect.top;

      const pointIndex = self.delaunay.find(posX, posY);
      currentPointIndex = pointIndex;

      const [x, y] = self.transformedPoints[pointIndex];
      const r = self.scale.r(currentTransform.k);

      // Draw pointer.
      d3.select(svgOverlay)
        .selectAll("circle")
        .data([[x, y]])
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("cx", (d) => d[0])
              .attr("cy", (d) => d[1])
              .attr("r", r + 3)
              .attr("stroke", "#C2C2C2")
              .attr("fill", "url(#fade)")
              .attr("filter", "url(#shadow)"),
          (update) =>
            update
              .transition()
              .duration(50)
              .attr("cx", (d) => d[0])
              .attr("cy", (d) => d[1]),
          (exit) => exit.remove()
        );

      const embedding = self.embeddings[pointIndex];
      const id = embedding.hierarchy_id;
      const sectionText = embedding.section_text;
      const metadataProperties = this.metadata.find((d) => d.id === id) || {};
      const { title, acronym, parallel_count, difficulty, reading_time } =
        metadataProperties;
      const currentTooltipData = {
        id: id,
        title: title.toUpperCase(),
        acronym: acronym,
        parallel_count: parallel_count,
        difficulty: difficulty,
        reading_time: reading_time,
        section_text: sectionText,
      };

      const tooltipLeftPos = self.scale.tooltipLeft(rect)(event.clientX);
      const verticalOffset = 20;

      if (event.clientY > window.innerHeight / 2) {
        this.tooltip
          .style("top", null)
          .style(
            "bottom",
            `${window.innerHeight - event.clientY + verticalOffset}px`
          );
      } else {
        this.tooltip
          .style("bottom", null)
          .style("top", `${event.clientY + verticalOffset}px`);
      }

      this.tooltip
        .style("left", `${tooltipLeftPos}px`)
        .style("display", "inline-block");

      if (this.tooltipData?.id !== id) {
        this.tooltipData = { id, ...currentTooltipData };
        this.updateTooltip(currentTooltipData);
      }
    });

    d3.select(ctx.canvas).on("touchend mouseleave", () => {
      this.tooltip.style("display", "none");
      d3.select(svgOverlay).selectAll("circle").remove();
    });

    zoomed(d3.zoomIdentity);

    return htl.html`
      <div class="scatterplot-container" style="position:relative; width:${this.width}px; height:${this.height}px;">
        ${canvas}
        ${svgOverlay}
      </div>
    `;
  }
}

export default Scatterplot;
