import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { serviceController } from "./service.controller.js";
import { serviceValidation } from "./service.validation.js";

const router = Router();

router.get("/", serviceController.getAllServices);

router.get("/:serviceId", serviceController.getServiceById);

router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.createServiceValidationSchema),
  serviceController.createService,
);

router.patch(
  "/:serviceId",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.updateServiceValidationSchema),
  serviceController.updateService,
);

router.delete("/:serviceId", auth(Role.TECHNICIAN), serviceController.deleteService);

export const serviceRoutes = router;
