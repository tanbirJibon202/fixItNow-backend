import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { bookingController } from "./booking.controller.js";
import { bookingValidation } from "./booking.validation.js";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(bookingValidation.createBookingValidationSchema),
  bookingController.createBooking,
);

router.get("/", auth(Role.CUSTOMER), bookingController.getMyBookings);

router.get(
  "/:bookingId",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  bookingController.getBookingById,
);

router.patch(
  "/:bookingId/cancel",
  auth(Role.CUSTOMER),
  bookingController.cancelBooking,
);

export const bookingRoutes = router;
