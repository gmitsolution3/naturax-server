import { Router } from "express";
import { getMeController, logInController, logOutController, SignUpController } from "../controllers/auth.controller";


const router = Router();


router.post("/sign-in",logInController)

router.post("/sign-up",SignUpController)

router.get("/me", getMeController);
router.post("/logout", logOutController);


export default router