import pool from "../../database/db";
import type { GetIssuesParams, TIssueData, UpdateIssueParams } from "./issues.interface";

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

export const getSingleIssueIntoDB = async (id: string) => {
  const issueResult = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];

  const userResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );

  const reporter = userResult.rows[0] || null;

  const { reporter_id, ...issueData } = issue;

  return {
    ...issueData,
    reporter,
  };
};


export const updateIssueIntoDB = async (params: UpdateIssueParams) => {
  const { id, title, description, type, status, currentUser } = params;

  const issueResult = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );

  if (issueResult.rows.length === 0) {
    return { notFound: true };
  }

  const issue = issueResult.rows[0];

  if (currentUser.role !== "maintainer") {
    if (issue.reporter_id !== currentUser.id) {
      return {
        forbidden: true,
        message: "You can only update your own issues",
      };
    }

    if (issue.status !== "open") {
      return {
        conflict: true,
        message: "Contributors cannot edit non-open issues",
      };
    }

    if (status && status !== issue.status) {
      return {
        forbidden: true,
        message: "Contributors cannot change workflow status",
      };
    }
  }

  const updatedTitle = title ?? issue.title;
  const updatedDescription = description ?? issue.description;
  const updatedType = type ?? issue.type;
  const updatedStatus = status ?? issue.status;

  const updateQuery = `
    UPDATE issues 
    SET title = $1,
        description = $2,
        type = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;

  const result = await pool.query(updateQuery, [
    updatedTitle,
    updatedDescription,
    updatedType,
    updatedStatus,
    id,
  ]);

  return {
    success: true,
    data: result.rows[0],
  };
};

