import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loginUserIntoDB, signUpIntoDB } from "./auth.services";

export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const newUser = await signUpIntoDB({ name, email, password, role });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error: any) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await loginUserIntoDB({ email, password });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error: any) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
};
