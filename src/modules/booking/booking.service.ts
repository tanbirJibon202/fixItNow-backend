import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateBookingPayload } from "./booking.interface";

const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.ACCEPTED,
  BookingStatus.PAID,
];

const createBooking = async (customerId: string, payload: ICreateBookingPayload) => {
  const service = await prisma.service.findUniqueOrThrow({
    where: { id: payload.serviceId },
  });

  if (!service.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "This service is not currently active");
  }

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt: new Date(payload.scheduledAt),
      address: payload.address,
      notes: payload.notes,
      price: service.price,
    },
    include: {
      service: true,
      technician: { include: { user: { select: { id: true, name: true } } } },
    },
  });
};

const getMyBookings = async (customerId: string) => {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      technician: { include: { user: { select: { id: true, name: true } } } },
      payment: true,
      review: true,
    },
  });
};

const getBookingById = async (bookingId: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true } } } },
      service: true,
      payment: true,
      review: true,
    },
  });

  const isOwnerCustomer = booking.customerId === userId;
  const isOwnerTechnician = booking.technician.userId === userId;

  if (role !== "ADMIN" && !isOwnerCustomer && !isOwnerTechnician) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this booking");
  }

  return booking;
};

const cancelBooking = async (bookingId: string, customerId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });

  if (booking.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this booking");
  }

  if (!CANCELLABLE_STATUSES.includes(booking.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Booking cannot be cancelled once it is ${booking.status}`,
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
