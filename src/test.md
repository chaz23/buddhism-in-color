---
sql:
  embeddings: data/sutta_section_embeddings.parquet
---

```js
const id_generator = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "a" + S4() + S4();
};
```

```js
const hover = (tip, pos, text) => {
  const side_padding = 10;
  const vertical_padding = 5;
  const vertical_offset = 15;

  // Empty it out
  tip.selectAll("*").remove();

  // Append the text
  tip
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("transform", `translate(${pos[0]}, ${pos[1] + 7})`)
    .selectAll("text")
    .data(text)
    .join("text")
    .style("dominant-baseline", "ideographic")
    .text((d) => d)
    .attr("y", (d, i) => (i - (text.length - 1)) * 15 - vertical_offset)
    .style("font-weight", (d, i) => (i === 0 ? "bold" : "normal"));

  const bbox = tip.node().getBBox();

  // Add a rectangle (as background)
  tip
    .append("rect")
    .attr("y", bbox.y - vertical_padding)
    .attr("x", bbox.x - side_padding)
    .attr("width", bbox.width + side_padding * 2)
    .attr("height", bbox.height + vertical_padding * 2)
    .style("fill", "white")
    .style("stroke", "#d3d3d3")
    .lower();
};
```

```js
const addTooltip = (chart) => {
  let wrapper = d3.select(chart);
  return chart;
};
```

```js
display(
  vg.plot(
    vg.dot(vg.from("embeddings"), {
      x: "x",
      y: "y",
      fill: "steelblue",
      stroke: "steelblue",
      strokeWidth: 0.5,
      channels: {
        Sutta: "sutta",
        Section: "section_text",
      },
      tip: {
        format: {
          x: false,
          y: false,
        },
        fontSize: 14,
      },
    }),
    // vg.panZoom(),
    vg.width(800),
    vg.height(800)
  )
);
```
