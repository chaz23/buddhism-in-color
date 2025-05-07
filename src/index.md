```js
import Deepscatter from "npm:deepscatter@latest";
import * as arrow from "npm:apache-arrow@latest";
```

```js
const suttaSectionEmbeddingsTable = await FileAttachment(
  "./data/sutta_section_embeddings.parquet"
).parquet();

const suttaSectionEmbeddingsArray = arrow.tableToIPC(
  suttaSectionEmbeddingsTable
);
```

```js
const plot = new Deepscatter("#plot", width, 600);
```

```js
plot
  .plotAPI({
    arrow_buffer: suttaSectionEmbeddingsArray,
    background_color: "grey",
    point_size: 2,
    alpha: 5,
    max_points: 1100000,
    encoding: {
      x: {
        field: "x",
      },
      y: {
        field: "y",
      },
      color: {
        constant: "green",
      },
    },
  })
  .then(() => {
    plot.click_function = (datum, plot) => console.log(datum);
    plot.tooltip_function = (datum, plot) => console.log(datum);
  });
```

```js
const scatterTooltip = (data) => {
  return `<div>${data.sutta}</div>`;
};
```

<div id="plot" style="min-width:${width}px"></div>
