import pool from "../../database/db";
import type { TIssueData } from "./issues.interface";

export const createIssuesIntoDB = async (payload: TIssueData) => {
  const result = await pool.query(
    `
      INSERT INTO issues 
      (title, description, type, status, reporter_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      payload.title,
      payload.description,
      payload.type,
      "open",
      payload.reporter_id,
    ],
  );
  return result.rows[0];
};
