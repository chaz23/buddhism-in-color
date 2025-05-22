```js
import Deepscatter from "npm:deepscatter@latest";
import * as arrow from "npm:apache-arrow@latest";

import scatterTooltip from "./components/scatterTooltip.js";
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
    // source_url: "https://benschmidt.org/arxiv",
    background_color: "grey",
    point_size: 10,
    alpha: 5,
    max_points: 100000,
    encoding: {
      x: {
        field: "x",
      },
      y: {
        field: "y",
      },
      color: {
        constant: "red",
      },
    },
  })
  .then(() => {
    plot.click_function = (datum, plot) => console.log(datum);
    plot.tooltip_html = (datum, plot) => scatterTooltip(datum);
  });
```

<div id="plot" style="min-width:${width}px"></div>
