import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { technicianService } from "./technician.service.js";

const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.upsertProfile(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile saved successfully",
    data: result,
  });
});

const setAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.setAvailability(req.user!.id, req.body.slots);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: result,
  });
});

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getAllTechnicians(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getTechnicianById(
    req.params.technicianId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician retrieved successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getMyBookings(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateBookingStatus(
    req.user!.id,
    req.params.bookingId as string,
    req.body.status,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const technicianController = {
  upsertProfile,
  setAvailability,
  getAllTechnicians,
  getTechnicianById,
  getMyBookings,
  updateBookingStatus,
};
