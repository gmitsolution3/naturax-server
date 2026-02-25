import { Router } from "express";
import {
  getSocialController,
  socialController,
} from "../controllers/social.controller";

const router = Router();

router.patch("/", socialController);

router.get("/", getSocialController);

export default router;
