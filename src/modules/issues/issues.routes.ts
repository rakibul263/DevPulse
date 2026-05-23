import { Router } from "express";
import {
  createIssuesController,
  getAllIssuesController,
  getSingleController,
} from "./issues.controller";

const router = Router();

router.get("/", getAllIssuesController);
router.get("/:id", getSingleController);

router.post("/", createIssuesController);

export default router;
