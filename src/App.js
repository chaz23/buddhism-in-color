import { useState } from "react";

import "./assets/App.css";
import { Sutta } from "./utils/sutta";

function App() {
  const x = new Sutta("mn1");
  const y = x.fetchSutta();
  console.log(y);
  // const z = y.then((s) => console.log(s));
  return <div>{}</div>;
}

export default App;
