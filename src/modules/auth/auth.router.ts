import { Router } from "express";
import { loginController, signupController } from "./auth.controller";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);

export default router;
