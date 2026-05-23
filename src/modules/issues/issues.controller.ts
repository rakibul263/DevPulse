import type { Request, Response } from "express";
import { createIssuesIntoDB } from "./issues.services";

export const createIssuesController = async (req: Request, res: Response) => {
  try {
    const result = await createIssuesIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: "Cannot Create Issues.",
      error: error.message,
    });
  }
};
