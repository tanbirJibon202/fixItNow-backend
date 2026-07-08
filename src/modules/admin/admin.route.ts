import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "../category/category.controller";
import { categoryValidation } from "../category/category.validation";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

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
