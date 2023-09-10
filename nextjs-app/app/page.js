"use client";

// import graph from "./graph";
import * as d3 from "d3";
import BarChart from "./Barchart";
import Concepts from "./Concepts";

export default function Home() {
  return (
    <div>
      <canvas />
      <Concepts />
    </div>
  );
}
