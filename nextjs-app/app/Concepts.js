import { Graph } from "@cosmograph/cosmos";
import nodes from "../data/nodes.json";
import links from "../data/links.json";

export default function Concepts() {
  const canvas = document.createElement("canvas");

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

  graph.setData(nodes, links);
  console.log(canvas);
  return canvas;
}

// import React, { Component } from "react";
// import * as d3 from "d3";

// import { Graph } from "@cosmograph/cosmos";
// import nodes from "../data/nodes.json";
// import links from "../data/links.json";

// class Concepts extends Component {
//   componentDidMount() {
//     this.drawChart();
//   }
//   drawChart() {
//     // const canvas = d3
//     //   .select("body")
//     //   .append("canvas")
//     //   .attr("width", 700)
//     //   .attr("height", 300);

//     const canvas = document.querySelector("canvas");

//     const config = {
//       simulation: {
//         repulsion: 0.5,
//       },
//       renderLinks: true,
//       events: {
//         onClick: (node) => {
//           console.log("Clicked node: ", node);
//         },
//       },
//       /* ... */
//     };

//     const graph = new Graph(canvas, config);

//     return graph.setData(nodes, links);
//   }
//   render() {
//     return <div id={"#" + this.props.id}></div>;
//   }
// }
// export default Concepts;
