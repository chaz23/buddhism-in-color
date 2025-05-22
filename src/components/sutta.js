import { FileAttachment } from "observablehq:stdlib";
import { DuckDBClient } from "npm:@observablehq/duckdb";

const db = await DuckDBClient.of({
  sutta_data: FileAttachment("./../data/sutta_data.parquet"),
  sutta_metadata: FileAttachment("./../data/sutta_hierarchy.parquet"),
});

class Sutta {
  constructor(_id) {
    this.id = _id;
  }

  async metadata(keys) {
    const metadataKeys = typeof keys === "string" ? keys : keys.join(", ");
    const query = `SELECT ${metadataKeys} FROM sutta_metadata WHERE id='${this.id}'`;
    const result = await db.query(query);
    return result.toArray()[0];
  }

  async html() {
    const query = `SELECT segment_text, html FROM sutta_data WHERE sutta='${this.id}'`;
    const result = await db.query(query);
    const html = result
      .toArray()
      .map((d) => d.html.replace(/{}/, d.segment_text))
      .join(" ");

    const div = document.createElement("div");
    div.innerHTML = `${html}`;
    return div;
  }

  async sectionText(section_num) {
    const query = `
      SELECT segment_text
      FROM sutta_data
      WHERE sutta='${this.id}' 
        AND section_num='${section_num}'`;
    const result = await db.query(query);
    return result
      .toArray()
      .map((d) => d.segment_text)
      .join(" ");
  }
}

export default Sutta;
