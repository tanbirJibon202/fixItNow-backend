import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReviewPayload) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (booking.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "This booking does not belong to you");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a booking after the job is completed",
    );
  }

  if (booking.review) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have already reviewed this booking");
  }

  return prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId,
      technicianId: booking.technicianId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

export const reviewService = {
  createReview,
};
