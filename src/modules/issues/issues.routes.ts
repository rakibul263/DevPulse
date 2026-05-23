import { Router } from "express";
import {
  createIssuesController,
  deleteIssueController,
  getAllIssuesController,
  getSingleController,
  updateIssueController,
} from "./issues.controller";

const router = Router();

router.get("/", getAllIssuesController);
router.get("/:id", getSingleController);

router.post("/", createIssuesController);
router.patch("/:id", updateIssueController);
router.delete("/:id", deleteIssueController);

export default router;
