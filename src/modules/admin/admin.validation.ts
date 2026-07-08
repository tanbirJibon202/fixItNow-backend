import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    activeStatus: z.enum(["ACTIVE", "BLOCKED"]),
  }),
});

export const adminValidation = {
  updateUserStatusValidationSchema,
};
