import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { reviewController } from "./review.controller.js";
import { reviewValidation } from "./review.validation.js";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(reviewValidation.createReviewValidationSchema),
  reviewController.createReview,
);

export const reviewRoutes = router;
