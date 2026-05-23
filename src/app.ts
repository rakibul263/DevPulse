import express from "express";
import config from "./config";
import issueRouter from "./modules/issues/issues.routes";
import authRouter from "./modules/auth/auth.router";

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("api/issues", issueRouter);

app.listen(config.port, () => {
  console.log(`server is running at port ${config.port}`);
});
