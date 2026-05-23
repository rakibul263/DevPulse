import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        role: 'contributor' | 'maintainer';
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Missing token, Authorization header required'
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }
    next();
  };
};