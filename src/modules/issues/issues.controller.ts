import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createIssuesIntoDB, deleteIssueIntoDB, getSingleIssueIntoDB, updateIssueIntoDB } from "./issues.services";
import { stringify } from "node:querystring";

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

export const getSingleController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data = await getSingleIssueIntoDB(String(id));

    if (!data) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message,
    });
  }
};


export const updateIssueController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const currentUser = (req as any).user;

    if (!currentUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await updateIssueIntoDB({
      id: String(id),
      title,
      description,
      type,
      status,
      currentUser,
    });

    if (result.notFound) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (result.forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: result.message,
      });
    }

    if (result.conflict) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Issue updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message,
    });
  }
};

export const deleteIssueController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await deleteIssueIntoDB(String(id));

    if (result.notFound) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message,
    });
  }
};
