import { sql } from "@vercel/postgres";

export async function fetchSQL(query) {
  try {
    const data = await sql.query(query);
    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
  }
}
