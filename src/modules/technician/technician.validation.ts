import { z } from "zod";

const upsertProfileValidationSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    skills: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
});

const setAvailabilityValidationSchema = z.object({
  body: z.object({
    slots: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
          endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
        }),
      )
      .min(1, "At least one availability slot is required"),
  }),
});

const updateBookingStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]),
  }),
});

export const technicianValidation = {
  upsertProfileValidationSchema,
  setAvailabilityValidationSchema,
  updateBookingStatusValidationSchema,
};
