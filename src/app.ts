import express from "express";
import authRouter from "./modules/auth/auth.router";
import issueRouter from "./modules/issues/issues.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

export default app;
