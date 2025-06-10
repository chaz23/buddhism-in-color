---
style: styles/front-page-style.css
---

<!-- CODE -->

```js
const width = window.innerWidth;
const height = window.innerHeight;
```

```js
const svg = htl.svg`<svg class="welcome-background"></svg>`;
const background = d3
  .select(svg)
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "hsl(0, 0%, 12%)");

const gTile = d3.select(svg).append("g");
```

```js
const tileSize = 40;

const numRows = Math.floor(height / tileSize) + 1;
const numCols = Math.floor(width / tileSize) * 3;

const yOff = (numRows * tileSize - height) / 2;
```

```js
const data = Array.from({ length: numCols }, (dx, ix) =>
  Array.from({ length: numRows }, (dy, iy) => ({
    id: `${ix},${iy}`,
    x: ix,
    y: iy,
  }))
).flat();
```

```js
const tileElement = (d) => {
  return htl.svg`<rect x=0 y=0 width=${tileSize} height=${tileSize} stroke="red" />`;
};
```

```js
const tile = gTile.selectAll("g").data(data, (d) => d.id);

tile.join(
  (enter) =>
    enter
      .append((d) => tileElement(d))
      .attr(
        "transform",
        (d) => `translate(${d.x * tileSize},${d.y * tileSize - yOff})`
      ),
  (exit) => exit.remove()
);
```

<!-- LAYOUT -->

```js
display(svg);
```
