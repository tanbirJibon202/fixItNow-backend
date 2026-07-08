import { z } from "zod";

const createBookingValidationSchema = z.object({
  body: z.object({
    serviceId: z.uuid("Invalid service id"),
    scheduledAt: z.iso.datetime({ message: "scheduledAt must be a valid ISO date" }),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const bookingValidation = {
  createBookingValidationSchema,
};
