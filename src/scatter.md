<!-- CODE -->

<!-- Imports. -->

```js
import Scatterplot from "./components/scatter.js";
```

<!-- Data. -->

```js
// Do not cache the data on Windows machines due to bug in duckdb-wasm.
const db = await DuckDBClient.of({
  scripture_metadata:
    FileAttachment("data/scripture_metadata.parquet").href +
    (navigator.userAgent.includes("Windows") ? `?t=${Date.now()}` : ""),
  sutta_embeddings:
    FileAttachment("data/sutta_embeddings.parquet").href +
    (navigator.userAgent.includes("Windows") ? `?t=${Date.now()}` : ""),
});

const scripture_metadata = db.query`SELECT * FROM scripture_metadata`;
```

```js
const sutta_embeddings = db.query(
  `SELECT * FROM sutta_embeddings WHERE section_text LIKE '%${text}%'`
);
```

<!-- State. -->

```js
let state = Mutable({ selectedMinimapNode: null });
const setState = (key, value) =>
  (state.value = {
    ...state.value,
    [key]: value,
  });
```

<!-- Components.  -->

```js
const scatter = new Scatterplot(
  sutta_embeddings,
  scripture_metadata,
  width,
  window.innerHeight * 0.85
);
```

<!-- LAYOUT -->

Enter text here to search and filter the scatterplot:  
(sorry still very much a work in progress!!!!)

```js
const text = view(Inputs.text());
```

```js
display(scatter.render());
```
