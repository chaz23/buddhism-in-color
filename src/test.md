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
// const $curr = vg.Param.value("mn1");
const $curr = vg.Selection.intersect("mn1");

const chart = vg.plot(
  vg.dot(vg.from("embeddings"), {
    x: "x",
    y: "y",
    fill: "steelblue",
    stroke: "steelblue",
    strokeWidth: 0.5,
    // select: "nearestXY",
  }),
  // vg.voronoi(vg.from("embeddings"), {
  //   x: "x",
  //   y: "y",
  //   fill: "section_text",
  //   stroke: "grey",
  //   fillOpacity: 0.3,
  //   // select: "nearestXY",
  // }),
  // vg.nearestY({ channels: ["x"], as: $curr }),
  // vg.highlight({ by: $curr }),
  vg.panZoom(),
  vg.width(800),
  vg.height(800)
);
```

```js
display($curr);
display(chart);
```

```js
// let a = await sql`SELECT * FROM embeddings`;
// a = a.toArray();
```

```js
// const del = d3.Delaunay.from(
//   a,
//   (d) => d.x,
//   (d) => d.y
// );
```

```js

```

```js
// const y = d3.select(chart).select("circle");
// console.log(y.datum());
// console.log(y._groups[0][0].attr("r"));
d3.select(chart)
  .select("svg")
  .on("mousemove", function (event, d) {
    console.log(event.clientX, event.clientY);
  });

// d3.select(chart)
//   .selectAll("circle")
//   .on("mouseover", function (event, d) {
//     console.log(d);
//   });
```
