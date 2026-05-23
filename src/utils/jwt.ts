import jwt from "jsonwebtoken";
import config from "../config";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, config.jwt_secret, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt_secret);
};
