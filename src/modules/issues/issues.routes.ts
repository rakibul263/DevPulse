import { Router } from "express";
import {
  createIssuesController,
  getAllIssuesController,
} from "./issues.controller";

const router = Router();

router.get("/", getAllIssuesController);
router.get("/:id");

router.post("/", createIssuesController);

export default router;
