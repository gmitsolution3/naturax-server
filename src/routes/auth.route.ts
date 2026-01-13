import { Router } from "express";
import {
  getMeController,
  logInController,
  logOutController,
  SignUpController,
} from "../controllers/auth.controller";
import logger from "../middleware/logger";

const router = Router();

router.post("/sign-in", logger, logInController);

router.post("/sign-up", SignUpController);

router.get("/me", logger, getMeController);
router.post("/logout", logger, logOutController);

export default router;
