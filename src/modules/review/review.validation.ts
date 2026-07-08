import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    bookingId: z.uuid("Invalid booking id"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = {
  createReviewValidationSchema,
};
