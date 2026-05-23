import { Router } from "express";
import { createIssuesController } from "./issues.controller";

const router = Router();

router.get("/", );
router.get("/:id");

router.post("/", createIssuesController);

export default router;
