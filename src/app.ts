import express from "express";
import config from "./config";

const app = express();

app.use(express.json());

app.use("/api/auth");
app.use("api/issues");

app.listen(config.port, () => {
  console.log(`server is running at port ${config.port}`);
});
