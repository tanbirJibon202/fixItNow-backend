import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { technicianController } from "./technician.controller.js";
import { technicianValidation } from "./technician.validation.js";

const publicRouter = Router();

publicRouter.get("/", technicianController.getAllTechnicians);
publicRouter.get("/:technicianId", technicianController.getTechnicianById);

const managementRouter = Router();

managementRouter.put(
  "/profile",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.upsertProfileValidationSchema),
  technicianController.upsertProfile,
);

managementRouter.put(
  "/availability",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.setAvailabilityValidationSchema),
  technicianController.setAvailability,
);

managementRouter.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  technicianController.getMyBookings,
);

managementRouter.patch(
  "/bookings/:bookingId",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.updateBookingStatusValidationSchema),
  technicianController.updateBookingStatus,
);

export const technicianPublicRoutes = publicRouter;
export const technicianManagementRoutes = managementRouter;
