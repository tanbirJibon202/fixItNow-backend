import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import { bookingValidation } from "./booking.validation";

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
