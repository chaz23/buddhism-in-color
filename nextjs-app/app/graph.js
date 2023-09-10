import { Graph } from "@cosmograph/cosmos";
import nodes from "../data/nodes.json";
import links from "../data/links.json";

import * as d3 from "d3";

export default function graph() {
  const canvas = d3.create("canvas");
  const config = {
    simulation: {
      repulsion: 0.5,
    },
    renderLinks: true,
    events: {
      onClick: (node) => {
        console.log("Clicked node: ", node);
      },
    },
    /* ... */
  };

  const graph = new Graph(canvas, config);

  return graph.setData(nodes, links);
}
