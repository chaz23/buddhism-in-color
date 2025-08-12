<!-- CODE -->

<!-- Imports. -->

```js
// import Minimap from "./components/minimap.js";
```

<!-- Data. -->

```js
// Do not cache the data on Windows machines due to bug in duckdb-wasm.
// const db = await DuckDBClient.of({
//   sutta_hierarchy:
//     FileAttachment("data/sutta_hierarchy.parquet").href +
//     (navigator.userAgent.includes("Windows") ? `?t=${Date.now()}` : ""),
// });

// const sutta_hierarchy = db.sql`SELECT * FROM sutta_hierarchy`;
```

<!-- State. -->

```js
// let state = Mutable({ selectedMinimapNode: null });
// const setState = (key, value) =>
//   (state.value = {
//     ...state.value,
//     [key]: value,
//   });
```

<!-- LAYOUT -->

```js
// display(state);
```

```js
// display(minimap(sutta_hierarchy, setState));
// const x = new Minimap(sutta_hierarchy, setState);
// display(x.visual());
```
