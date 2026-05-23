import bcrypt from "bcrypt";
import pool from "../../database/db";
import type { authLoginUser, loginUser } from "./auth.interface";
import { generateToken } from "../../utils/jwt";

export const signUpIntoDB = async (payload: authLoginUser) => {
  const { name, email, password, role } = payload;

  const userRole = role === "maintainer" ? "maintainer" : "contributor";

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );
  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertQuery = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;

  const result = await pool.query(insertQuery, [
    name,
    email,
    hashedPassword,
    userRole,
  ]);

  return result.rows[0];
};

export const loginUserIntoDB = async (payload:loginUser ) => {
  const { email, password } = payload;

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};