import z from "zod";

export const getAllCustomersSchema = z.object({
  page: z.number().default(1),
  name: z.string().optional(),
  email: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
