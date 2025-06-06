<!-- ---
sql:
  sutta_hierarchy: data/sutta_hierarchy.parquet
---

```sql id=sutta_hierarchy
SELECT * FROM sutta_hierarchy
``` -->

```js
const db = DuckDBClient.of({
  sutta_hierarchy:
    FileAttachment("data/sutta_hierarchy.parquet").href +
    (navigator.userAgent.includes("Windows") ? `?t=${Date.now()}` : ""),
});
```

```js
const sutta_hierarchy = db.sql`SELECT * FROM sutta_hierarchy`;
```

```js
import minimap from "./components/minimap.js";
```

```js
// let state = Mutable({ selectedText: null, renderedText: null });
let state = Mutable({ selectedText: null, renderedText: null });
const setState = (key, value) =>
  (state.value = {
    ...state.value,
    [key]: value,
  });
```

```js
display(state);
```

```js
display(minimap(sutta_hierarchy, setState));
```
