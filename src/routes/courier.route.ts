import { Router } from "express";
import {
  assignCourier,
  getCourierStatusForOrder,
  assignCourierBulk
} from "../controllers/courier.controller";

const router = Router();

router.post("/assign", assignCourier);

router.post("/assign/bulk", assignCourierBulk)

router.get("/order-status/:orderId", getCourierStatusForOrder);

export default router;
