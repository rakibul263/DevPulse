import { Router } from "express";
import { loginController, signupController } from "./autn.controller";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);

export default router;
