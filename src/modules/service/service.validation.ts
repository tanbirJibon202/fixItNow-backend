import { z } from "zod";

const createServiceValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().min(1, "Description is required"),
    price: z.number().positive("Price must be a positive number"),
    durationMins: z.number().int().positive().optional(),
    categoryId: z.uuid("Invalid category id"),
  }),
});

const updateServiceValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    durationMins: z.number().int().positive().optional(),
    categoryId: z.uuid().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const serviceValidation = {
  createServiceValidationSchema,
  updateServiceValidationSchema,
};
