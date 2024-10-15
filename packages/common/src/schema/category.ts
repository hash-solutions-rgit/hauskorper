import z from "zod";

export const getAllCategoriesSchema = z.object({
  cursor: z.number().default(1),
  limit: z.number().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  parentCategoryId: z.string().optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
