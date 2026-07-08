import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().optional(),
  }),
});

export const categoryValidation = {
  createCategoryValidationSchema,
};
