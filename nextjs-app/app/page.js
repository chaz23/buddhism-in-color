import { fetchSQL } from "./lib/data";
import * as suttaHierarchy from "./lib/static-data/sutta_hierarchy.json";
import SuttaPlex from "./ui/SuttaPlex";
import * as aq from "arquero";
import * as tidy_sutta_data from "./lib/static-data/tidy_sutta_data.json";

export default async function Home() {
  let sutta_df = aq.from(tidy_sutta_data);
  // console.log(sutta_df.filter((d) => d.title === "The Divine Net").print());
  console.log(sutta_df.slice(1, 5).print());
}

// export default async function Home() {
//   const metadata = await fetchSQL(`SELECT * FROM sutta_metadata`);

//   let suttaData = [];

//   for (let i = 0; i < metadata.length; i++) {
//     suttaData.push({
//       ...metadata[i],
//       ...suttaHierarchy.find(
//         (itmInner) => itmInner.sutta === metadata[i].sutta
//       ),
//     });
//   }

//   let data = suttaData.filter((d) => d.collection === "dn");
//   const maxWords = data.reduce((prev, current) =>
//     prev && prev > current.words ? prev : current.words
//   );

//   data = data.map((d) => (
//     <SuttaPlex
//       sutta={d.sutta}
//       collection={d.collection}
//       blurb={d.blurb}
//       words={d.words}
//       difficulty={d.difficulty}
//       maxWords={maxWords}
//     ></SuttaPlex>
//   ));
//   return <div>{data}</div>;
// }
