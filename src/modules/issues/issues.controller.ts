import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createIssuesIntoDB } from "./issues.services";

export const createIssuesController = async (req: Request, res: Response) => {
  try {
    const result = await createIssuesIntoDB(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Cannot Create Issues.",
      error: error.message,
    });
  }
};

export const getAllIssuesController = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;

    const data = await {
      sort: sort as string,
      type: type as string,
      status: status as string,
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Cannot Create Issues.",
      error: error.message,
    });
  }
};
