import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authController } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(authValidation.registerValidationSchema),
  authController.registerUser,
);

router.post(
  "/login",
  validateRequest(authValidation.loginValidationSchema),
  authController.loginUser,
);

router.post("/refresh-token", authController.refreshToken);

router.get("/me", auth(), authController.getMe);

router.patch(
  "/me",
  auth(),
  validateRequest(authValidation.updateProfileValidationSchema),
  authController.updateMyProfile,
);

export const authRoutes = router;
