"use client";

// import graph from "./graph";
import * as d3 from "d3";
import BarChart from "./Barchart";
import Concepts from "./Concepts";
import pull from "@/utils/pull";
import Sutta from "@/utils/sutta";

export default function Home() {
  const characterData = pull(
    "https://raw.githubusercontent.com/chaz23/buddhism-in-color/main/projects/sutta-characters/data/pli2en_dppn_updated.json"
  ).json();

  const x = new Sutta("mn1");
  const y = x.translation;

  if (characterData.isLoading || y.isLoading) return null;

  const sutta = y.data;

  const characters = characterData.data;
  console.log(characters);

  // if (y.isLoading) return null;
  console.log(sutta);

  return (
    <div>
      <canvas />
      <Concepts />
    </div>
  );
}
