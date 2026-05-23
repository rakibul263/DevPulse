import pool from "../../database/db";
import type { GetIssuesParams, TIssueData } from "./issues.interface";

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

export const getAllIssuesIntoDb = async (payload: GetIssuesParams) => {
  const { sort, type, status } = payload;

  let queryText = "SELECT * FROM issues WHERE 1=1";
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (type === "bug" || type === "feature_request") {
    queryText += ` AND type = $${paramIndex}`;
    queryParams.push(type);
    paramIndex++;
  }

  if (status === "open" || status === "in_progress" || status === "resolved") {
    queryText += ` AND status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  queryText +=
    sort === "oldest"
      ? " ORDER BY created_at ASC"
      : " ORDER BY created_at DESC";

  const issuesResult = await pool.query(queryText, queryParams);
  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = Array.from(
    new Set(issues.map((issue: any) => issue.reporter_id)),
  );

  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds],
  );

  const userMap: Record<number, any> = {};

  usersResult.rows.forEach((user: any) => {
    userMap[user.id] = user;
  });

  const finalIssues = issues.map((issue: any) => {
    const { reporter_id, ...rest } = issue;

    return {
      ...rest,
      reporter: userMap[reporter_id] || null,
    };
  });

  return finalIssues;
};
