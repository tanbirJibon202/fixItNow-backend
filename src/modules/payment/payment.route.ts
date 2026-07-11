import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { paymentController } from "./payment.controller.js";
import { paymentValidation } from "./payment.validation.js";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(paymentValidation.createPaymentValidationSchema),
  paymentController.createCheckoutSession,
);

router.post("/webhook", paymentController.handleWebhook);

router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getMyPayments);

router.get(
  "/:paymentId",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentController.getPaymentById,
);

export const paymentRoutes = router;
