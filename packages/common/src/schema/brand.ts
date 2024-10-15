import z from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
});

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>;
