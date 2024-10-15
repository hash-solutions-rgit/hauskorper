import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { randomUUID } from "crypto";
import {
  Cart,
  CartProduct,
  Prisma,
  PrismaClient,
  Product,
} from "@vapestation/database";
import { pmedFormSchema, PMedForm } from "common/schema/forms/pmeds";
import { TRPCError } from "@trpc/server";
import { priceCalculatorWithTax, roundToTwoCeil } from "common";

export const cartRouter = createTRPCRouter({
  createOrUpdate: publicProcedure
    .input(
      z.object({
        cartId: z.string().optional(),
        productId: z.string(),
        quantity: z.number(),
        userId: z.string().optional().nullable(),
        productMetaForm: z
          .object({
            formMetaData: pmedFormSchema,
            tagSlug: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, auth } = ctx;

      const { cartId, productId, quantity, userId, productMetaForm } = input;

      const customerId = userId ? userId : (auth.userId ?? randomUUID());

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
        include: {
          taxClass: true,
        },
      });

      let cart: Cart;

      // check if the cart id provided
      if (!cartId) {
        const taxedPrice = priceCalculatorWithTax(
          product.sellingPrice,
          product.taxClass.rate,
        );
        // create a cart
        cart = await prisma.cart.create({
          data: {
            customerId,
            products: [
              {
                id: productId,
                quantity,
                price: taxedPrice,
                ...(productMetaForm && {
                  formMetaData: {
                    productId,
                    tagSlug: productMetaForm.tagSlug,
                    value: productMetaForm.formMetaData,
                  },
                }),
              },
            ],
            totalAmount: roundToTwoCeil(taxedPrice * quantity),
          },
        });
      } else {
        const updatedData = await updateCart(
          prisma,
          cartId,
          quantity,
          product,
          productMetaForm?.formMetaData,
          productMetaForm?.tagSlug,
        );
        cart = await prisma.cart.update({
          where: {
            id: cartId ?? "",
          },
          data: updatedData,
        });
      }

      return cart;
    }),

  findCart: publicProcedure
    .input(z.string().optional().nullable())
    .query(async ({ ctx, input: cartId }) => {
      const { prisma } = ctx;

      if (!cartId) return null;

      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
      });

      const productsPromise = cart?.products?.map(async (item) => {
        const product = await prisma?.product.findUniqueOrThrow({
          where: {
            id: item.id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            inStock: true,
            costPrice: true,
            tagSlug: true,
          },
        });
        const updatedProducts = {
          ...item,
          ...product,
        };
        return updatedProducts;
      });

      const products = await Promise.all(productsPromise ?? []);

      return { ...cart, products };
    }),
  deleteItemFromCart: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { cartId, productId } = input;

      const cart = await prisma.cart.findFirstOrThrow({
        where: {
          id: cartId,
        },
      });

      const products = cart.products.filter(
        (product) => product.id !== productId,
      );

      const totalAmount = roundToTwoCeil(
        products.reduce((sum, product) => {
          return sum + product.price * product.quantity;
        }, 0),
      );

      const updatedCart = await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          products,
          totalAmount,
        },
      });

      return updatedCart;
    }),

  updateProductQuantityInCart: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        cartId: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { cartId, productId, quantity: productQuantity } = input;

      const cart = await prisma.cart.findUniqueOrThrow({
        where: {
          id: cartId,
        },
        select: {
          products: true,
        },
      });

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
        select: {
          inventory: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const selectedProduct = cart.products.find((p) => p.id === productId);

      if (!selectedProduct) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product not in cart",
        });
      }

      const quantity =
        productQuantity > product.inventory.quantity
          ? product.inventory.quantity
          : productQuantity;

      const totalAmount = roundToTwoCeil(
        cart.products.reduce((sum, product) => {
          if (product.id === productId) {
            return sum + quantity * product.price;
          }
          return sum + product.quantity * product.price;
        }, 0),
      );

      await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          products: {
            updateMany: {
              where: {
                id: productId,
              },
              data: {
                quantity,
              },
            },
          },
          totalAmount,
        },
      });
    }),
});

async function updateCart(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, any>,
  cartId: string,
  quantity: number,
  product: Prisma.ProductGetPayload<{
    include: {
      taxClass: true;
    };
  }>,
  productMetaForm?: PMedForm,
  tagSlug?: string,
) {
  const cart = await prisma.cart.findUnique({
    where: {
      id: cartId,
    },
  });

  const { id: productId, sellingPrice, taxClass } = product;

  const taxedPrice = priceCalculatorWithTax(sellingPrice, taxClass.rate);

  const productIndex = cart?.products.findIndex((product) => {
    return product.id === productId;
  });

  let products: CartProduct[];

  if (productIndex === undefined || productIndex < 0) {
    products = [
      ...(cart?.products ?? []),
      {
        id: productId,
        price: taxedPrice,
        quantity,

        formMetaData:
          productMetaForm && tagSlug
            ? {
                productId,
                tagSlug,
                value: JSON.parse(JSON.stringify(productMetaForm)),
              }
            : null,
      },
    ];
  } else {
    products = [...(cart?.products ?? [])];
    let productQuantity =
      product.inventory.quantity <
      (products[productIndex]?.quantity ?? 0) + quantity
        ? product.inventory.quantity
        : (products[productIndex]?.quantity ?? 0) + quantity;

    if (product.limitPerUser > 0 && productQuantity > product.limitPerUser) {
      productQuantity = product.limitPerUser;
    }

    products[productIndex] = {
      id: productId,
      price: taxedPrice,
      quantity: productQuantity,
      formMetaData:
        productMetaForm && tagSlug
          ? {
              productId,
              tagSlug,
              value: JSON.parse(JSON.stringify(productMetaForm)),
            }
          : null,
    };
  }

  // check if the product restricted in category

  const [diarrhoeaRestriction, restrictedCategories] = await Promise.all([
    checkDiarrhoeaRestriction(prisma, products),
    checkRestrictedCategories(prisma, products),
  ]);

  if (diarrhoeaRestriction || restrictedCategories) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You cannot add more than 1 product from these categories to your cart`,
    });
  }

  const totalAmount = roundToTwoCeil(
    products.reduce((amount, product) => {
      return amount + product.price * quantity;
    }, 0),
  );

  return {
    totalAmount,
    products,
  };
}

async function checkDiarrhoeaRestriction(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, any>,
  products: ({
    id: string;
    quantity: number;
    price: number;
  } & {
    formMetaData: {
      productId: string;
      value: Prisma.JsonValue | null;
      tagSlug: string;
    } | null;
  })[],
): Promise<boolean> {
  const diarrhoeaCategoryProducts = await prisma.category.findUnique({
    where: {
      slug: "2-diarrhoea",
    },
    select: {
      id: true,
      products: {
        where: {
          id: {
            in: products.map((product) => product.id),
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  return !!(
    diarrhoeaCategoryProducts &&
    (diarrhoeaCategoryProducts?.products.length > 1 ||
      diarrhoeaCategoryProducts?.products.reduce((sum, product) => {
        const p = products.find((p) => p.id === product.id);
        if (!p) return sum;
        return sum + p.quantity;
      }, 0) > 1)
  );
}

async function checkRestrictedCategories(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, any>,
  products: ({
    id: string;
    quantity: number;
    price: number;
  } & {
    formMetaData: {
      productId: string;
      value: Prisma.JsonValue | null;
      tagSlug: string;
    } | null;
  })[],
) {
  const restrictedCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: ["opiod-analgesics", "sleeping-tablets", "paracetamol"],
      },
    },
    select: {
      id: true,
      products: {
        where: {
          id: {
            in: products.map((product) => product.id),
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  const restrictedProducts = restrictedCategories.flatMap(
    (category) => category.products,
  );

  return !!(
    restrictedProducts &&
    (restrictedProducts.length > 1 ||
      restrictedProducts?.reduce((sum, product) => {
        const p = products.find((p) => p.id === product.id);
        if (!p) return sum;
        return sum + p.quantity;
      }, 0) > 1)
  );
}
