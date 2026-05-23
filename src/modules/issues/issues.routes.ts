import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth.middleware";
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
router.patch("/:id", authenticateJWT, updateIssueController);
router.delete("/:id", authenticateJWT, deleteIssueController);

export default router;
