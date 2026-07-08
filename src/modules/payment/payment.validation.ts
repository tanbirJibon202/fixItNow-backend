import { z } from "zod";

const createPaymentValidationSchema = z.object({
  body: z.object({
    bookingId: z.uuid("Invalid booking id"),
  }),
});

export const paymentValidation = {
  createPaymentValidationSchema,
};
