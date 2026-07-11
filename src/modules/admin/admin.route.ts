import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { categoryController } from "../category/category.controller.js";
import { categoryValidation } from "../category/category.validation.js";
import { adminController } from "./admin.controller.js";
import { adminValidation } from "./admin.validation.js";

const router = Router();

router.use(auth(Role.ADMIN));

router.get("/users", adminController.getAllUsers);
router.patch(
  "/users/:userId",
  validateRequest(adminValidation.updateUserStatusValidationSchema),
  adminController.updateUserStatus,
);

router.get("/bookings", adminController.getAllBookings);

router.get("/categories", categoryController.getAllCategories);
router.post(
  "/categories",
  validateRequest(categoryValidation.createCategoryValidationSchema),
  categoryController.createCategory,
);

export const adminRoutes = router;
