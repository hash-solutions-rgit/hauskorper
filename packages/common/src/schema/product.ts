import { z } from "zod";
import { $Enums } from "@vapestation/database";

export const getProductSchema = z.object({
  status: z
    .enum([
      $Enums.ProductStatus.ARCHIVED,
      $Enums.ProductStatus.DRAFT,
      $Enums.ProductStatus.PUBLISHED,
    ])
    .optional(),
  name: z.string().optional(),
  brandName: z.string().optional(),
});

export const getProductsSchema = getProductSchema.extend({
  cursor: z.number().default(1),
  limit: z.number().optional(),
});

export const googleAdsMetadataSchema = z.object({
  brand: z.string(),
  gtin: z.string(),
  pipCode: z.string().optional(),
});

export const inventorySchema = z.object({
  quantity: z.number().positive().int(),
  allowBackOrder: z.enum([
    $Enums.BackOrder.ALLOW,
    $Enums.BackOrder.DENY,
    $Enums.BackOrder.NOTIFY,
  ]),
  lowStockAlert: z.number().positive().int(),
  limitOneItemPerOrder: z.boolean().optional().default(false),
});

export const createProductFormSchema = z.object({
  name: z.string().min(1),
  costPrice: z.number().optional(),
  sellingPrice: z.number(),
  discountPrice: z.number().optional(),
  image: z.string(),
  description: z.string().min(1),
  longDescription: z.string().min(1).optional(),
  gallery: z.array(z.string().url()).optional(),
  status: z.enum([
    $Enums.ProductStatus.ARCHIVED,
    $Enums.ProductStatus.DRAFT,
    $Enums.ProductStatus.PUBLISHED,
  ]),
  slug: z.string().min(1),
  categoryIds: z.array(z.string().min(1)),
  googleAdsMeta: googleAdsMetadataSchema,
  publishedDate: z.date().optional(),
  limitPerUser: z.number().int().optional(),
  inventory: inventorySchema,
  blockGuest: z.boolean().optional(),
  isDeleted: z.boolean().default(false),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  crossSellProductIds: z.array(z.string()).optional(),
  upSellProductIds: z.array(z.string()).optional(),
  brandId: z.string().default("666eea680322fd433e3e5562"),
  sku: z.number().int().positive().optional(),
  dimension: z.object({
    height: z.number().default(0),
    weight: z.number().default(0),
    length: z.number().default(0),
  }),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const productColumns = [
  "image",
  "sku",
  "name",
  "costPrice",
  "sellingPrice",
  "inventory.quantity",
  "status",
  "slug",
  "categories.name",
  "brand.name",
  "description",
  "longDescription",
] as const;
