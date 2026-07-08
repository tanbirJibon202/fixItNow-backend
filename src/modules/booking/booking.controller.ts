import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.createBooking(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getMyBookings(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getBookingById(
    req.params.bookingId as string,
    req.user!.id,
    req.user!.role,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.cancelBooking(
    req.params.bookingId as string,
    req.user!.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
