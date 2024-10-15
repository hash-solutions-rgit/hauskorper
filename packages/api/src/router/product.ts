import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure, publicProcedure } from "../trpc";
import {
  createProductFormSchema,
  getProductsSchema,
} from "common/schema/product";
import { z } from "zod";
import { $Enums, Product } from "@vapestation/database";
import { applyPatch } from "fast-json-patch";
import { imageFullPath, priceCalculatorWithTax } from "common";

export const productRouter = createTRPCRouter({
  getAllProducts: publicProcedure
    .input(getProductsSchema)
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { brandName, status, name, cursor, limit } = input;

      // set take and skip
      const take = limit ?? 20;
      const skip = (cursor - 1) * take;

      // get products
      const productsPromise = prisma.product.findMany({
        take: take + 1,
        skip,
        where: {
          isDeleted: false,
          name: {
            contains: name,
          },
          status,
        },
        include: { categories: true, brand: true },
        orderBy: {
          createdAt: "desc",
        },
      });

      // count all products
      const countProductPromise = prisma.product.count({
        where: {
          isDeleted: false,
          name: {
            contains: name,
          },
          status,
        },
      });

      // wait for all promises to resolve
      const responses = await Promise.allSettled([
        productsPromise,
        countProductPromise,
      ]);

      // check if any promise failed
      responses.forEach((response) => {
        if (response.status === "rejected") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: response.reason.message,
          });
        }
      });

      // get products and count
      const products =
        responses[0].status === "fulfilled" ? responses[0].value : [];

      const count =
        responses[1].status === "fulfilled" ? responses[1].value : 0;

      let nextCursor: typeof cursor | undefined = undefined;

      if (products.length > take) {
        const nextItem = products.pop();
        nextCursor = cursor + 1;
      }

      return {
        products,
        totalProducts: count,
        page: cursor,
        nextCursor,
      };
    }),

  getProduct: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: productSlug }) => {
      const { prisma } = ctx;

      const product = await prisma.product.findUnique({
        where: {
          slug: productSlug,
        },
        include: {
          brand: true,
          taxClass: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          message: "Product not found",
          code: "NOT_FOUND",
        });
      }

      return {
        ...product,
        sellingPrice: priceCalculatorWithTax(
          product.sellingPrice,
          product.taxClass?.rate ?? 20,
        ),
      };
    }),

  getProductById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      const product = await prisma.product.findUnique({
        where: {
          id,
        },
      });

      if (!product) {
        throw new TRPCError({
          message: "Product not found",
          code: "NOT_FOUND",
        });
      }

      return product;
    }),

  createProduct: adminProcedure
    .input(createProductFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, auth } = ctx;

      const skuCounter = await prisma.counter.findFirstOrThrow({
        where: {
          name: "productSku",
        },
      });

      // ! TODO: Add upsell and crsos sell
      // const productUpSellQuery = prisma.upSellProduct.create({
      //   data: {},
      // });

      // const crossSellQuery = prisma.crossSellProduct.create({
      //   data: {},
      // });

      // batch queries
      // const [productUpSell, crossSell] = await Promise.all([
      //   productUpSellQuery,
      //   crossSellQuery,
      // ]);

      const taxClass = await prisma.taxClass.findFirstOrThrow({
        where: {
          name: "Standard",
        },
      });

      const product = await prisma.product.create({
        data: {
          ...input,
          sku: skuCounter.count,
          slug: input.slug.toLowerCase().replace(/ /g, "-"),
          // upSellProductId: productUpSell.id,
          // crossSellProductId: crossSell.id,
          createdBy: auth.userId,
          taxClassId: taxClass.id,
        },
      });

      const updateCategoryRequest = prisma.category.updateMany({
        where: {
          id: {
            in: input.categoryIds,
          },
        },
        data: {
          productIds: {
            push: product.id,
          },
        },
      });

      const updateCounterRequest = prisma.counter.update({
        where: {
          name: "productSku",
        },
        data: {
          count: skuCounter.count + 1,
        },
      });

      await Promise.all([updateCategoryRequest, updateCounterRequest]);

      return product;
    }),

  deleteProduct: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id: input,
        },
      });

      await prisma.product.update({
        where: {
          id: input,
        },
        data: {
          isDeleted: true,
        },
      });

      return product;
    }),

  changeProductStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          $Enums.ProductStatus.PUBLISHED,
          $Enums.ProductStatus.DRAFT,
          $Enums.ProductStatus.ARCHIVED,
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { id, status } = input;

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id,
        },
      });

      await prisma.product.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return product;
    }),

  updateProduct: adminProcedure
    .input(
      z.object({
        patch: z.any(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { patch, id } = input;

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id,
        },
      });

      const updatedProduct = applyPatch(product, patch).newDocument;

      const productBody: Omit<Product, "id"> = { ...updatedProduct };

      const newProduct = await prisma.product.update({
        where: {
          id,
        },
        data: productBody,
      });

      return newProduct;
    }),

  getProductSchemaCode: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { prisma, req } = ctx;

      const { headers } = req;

      // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
      const hostname = headers.get("host")!;

      const product = await prisma.product.findUnique({
        where: {
          id: input,
        },
        include: {
          brand: true,
          taxClass: {
            select: {
              id: true,
              rate: true,
            },
          },
          categories: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const json = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": product.id,
        url: `https://${hostname}/${product.slug}`,
        name: product.name,
        image: imageFullPath(product.image),
        description: product.description,
        sku: product.sku,
        mpn: product.googleAdsMeta?.gtin,
        weight: product.dimension?.weight,
        width: product.dimension?.length,
        height: product.dimension?.height,
        gtin13: product.googleAdsMeta?.gtin,
        gtin: product.googleAdsMeta?.gtin,
        category: product.categories[0]?.name,
        brand: {
          "@type": product.brand.name,
          name: product.brand.name,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "50",
          reviewCount: "10",
        },
        review: {
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
          },
          author: {
            "@type": "Person",
            name: product.createdBy,
          },
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "GBP",
          price: priceCalculatorWithTax(
            product.sellingPrice,
            product.taxClass?.rate ?? 20,
          ),
          itemCondition: "https://schema.org/NewCondition",
          availability: `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`,
          seller: {
            "@type": "Organization",
            name: "Vapestation",
          },
        },
      };

      return json;
    }),

  getProductQuantity: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: slug }) => {
      const { prisma } = ctx;

      const product = await prisma.product.findUniqueOrThrow({
        where: {
          slug,
        },

        select: {
          id: true,
          inventory: true,
          inStock: true,
        },
      });

      return product;
    }),
});
