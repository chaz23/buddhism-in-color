import "./assets/App.css";
import { Sutta } from "./utils/sutta";

function App() {
  const x = new Sutta("thag3.2");
  console.log(x.collection);
  return <div>{x.fetchSutta()}</div>;
}

export default App;
