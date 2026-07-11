import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import config from "./config/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { adminRoutes } from "./modules/admin/admin.route.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookingRoutes } from "./modules/booking/booking.route.js";
import { categoryRoutes } from "./modules/category/category.route.js";
import { paymentRoutes } from "./modules/payment/payment.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { serviceRoutes } from "./modules/service/service.route.js";
import {
  technicianManagementRoutes,
  technicianPublicRoutes,
} from "./modules/technician/technician.route.js";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/payments/webhook") {
    return next();
  }
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("FixItNow API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/technicians", technicianPublicRoutes);
app.use("/api/technician", technicianManagementRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
