import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import {
  IAvailabilitySlot,
  ITechnicianQuery,
  IUpsertTechnicianProfilePayload,
} from "./technician.interface";

const upsertProfile = async (
  userId: string,
  payload: IUpsertTechnicianProfilePayload,
) => {
  return prisma.technicianProfile.upsert({
    where: { userId },
    create: { userId, ...payload },
    update: payload,
  });
};

const setAvailability = async (userId: string, slots: IAvailabilitySlot[]) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please create your technician profile before setting availability",
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { technicianId: profile.id } });

    await tx.availability.createMany({
      data: slots.map((slot) => ({ ...slot, technicianId: profile.id })),
    });

    return tx.availability.findMany({ where: { technicianId: profile.id } });
  });
};

const getAllTechnicians = async (query: ITechnicianQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const technicians = await prisma.technicianProfile.findMany({
    where: {
      AND: [
        query.location
          ? { location: { contains: query.location, mode: "insensitive" } }
          : {},
        query.categoryId
          ? { services: { some: { categoryId: query.categoryId } } }
          : {},
        query.searchTerm
          ? { user: { name: { contains: query.searchTerm, mode: "insensitive" } } }
          : {},
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: true,
      reviews: { select: { rating: true } },
    },
  });

  const withRating = technicians.map((tech) => {
    const totalReviews = tech.reviews.length;
    const avgRating =
      totalReviews > 0
        ? tech.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const { reviews, ...rest } = tech;
    return { ...rest, avgRating, totalReviews };
  });

  const minRating = query.minRating ? Number(query.minRating) : undefined;
  const filtered = minRating
    ? withRating.filter((tech) => tech.avgRating >= minRating)
    : withRating;

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    data: paginated,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: { where: { isActive: true } },
      availabilities: true,
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const totalReviews = technician.reviews.length;
  const avgRating =
    totalReviews > 0
      ? technician.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return { ...technician, avgRating, totalReviews };
};

const getMyBookings = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Technician profile not found");
  }

  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: true,
      payment: true,
    },
  });
};

const ALLOWED_TRANSITIONS: Record<string, BookingStatus[]> = {
  REQUESTED: [BookingStatus.ACCEPTED, BookingStatus.DECLINED],
  PAID: [BookingStatus.IN_PROGRESS],
  IN_PROGRESS: [BookingStatus.COMPLETED],
};

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  status: BookingStatus,
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Technician profile not found");
  }

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });

  if (booking.technicianId !== profile.id) {
    throw new AppError(httpStatus.FORBIDDEN, "This booking does not belong to you");
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[booking.status] ?? [];

  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change booking status from ${booking.status} to ${status}`,
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const technicianService = {
  upsertProfile,
  setAvailability,
  getAllTechnicians,
  getTechnicianById,
  getMyBookings,
  updateBookingStatus,
};
