import z from "zod";
import parsePhoneNumber from "libphonenumber-js";

export const addressSchema = z.object({
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  post_code: z.string(),
  state: z.string().optional(),
  district: z.string().optional(),
});

export const stripeCheckoutSessionSchema = z.object({
  lineItems: z.array(
    z.object({
      price_data: z.object({
        currency: z.string(),
        unit_amount: z.number(),
        product_data: z.object({
          name: z.string(),
          images: z.array(z.string()),
        }),
      }),
      quantity: z.number(),
    }),
  ),
  address: addressSchema,
  customerEmail: z.string().email(),
  cartId: z.string(),
  name: z.string(),
  phone: z.string().length(10),
});

export type AddressSchema = z.infer<typeof addressSchema>;

export const stripeCheckoutSessionFormSchema = z.object({
  address: addressSchema,
  customerEmail: z.string().email(),
  name: z.string(),
  phone: z.string().length(10),
});

export type StripeCheckoutSessionForm = z.infer<
  typeof stripeCheckoutSessionFormSchema
>;
