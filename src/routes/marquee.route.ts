import { Router } from "express";
import {
  createMarqueeController,
  deleteMarqueeController,
  getAllMarquee,
  getMarqueeController,
  toggleMarqueeStatusController,
  updateMarquee,
} from "../controllers/marquee.controller";

const router = Router();

router.post("/created", createMarqueeController);
router.get("/get-marquee", getMarqueeController);
router.get("/get-all-marquee", getAllMarquee);
router.put("/update-marquee/:id", updateMarquee);
router.put("/toggle/:id", toggleMarqueeStatusController);
router.delete("/delete/:id", deleteMarqueeController);

export default router;
