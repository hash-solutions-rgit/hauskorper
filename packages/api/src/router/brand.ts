import { z } from "zod";
import { createTRPCRouter, adminProcedure, publicProcedure } from "../trpc";
import { createBrandSchema } from "common/schema/brand";
import { applyPatch } from "fast-json-patch";
import { Brand } from "@vapestation/database";

export const brandRouter = createTRPCRouter({
  getAllBrands: publicProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;

      const page = cursor ?? 1;

      const { prisma } = ctx;

      const skip = (page - 1) * limit;

      const brands = await prisma.brand.findMany({
        take: limit + 1,
        skip,
      });

      const nextCursor = brands.length > limit ? page + 1 : null;

      return {
        brands: brands.slice(0, limit),
        nextCursor,
        page,
      };
    }),
  addBrand: adminProcedure
    .input(createBrandSchema)
    .mutation(async ({ ctx, input: createBrandBody }) => {
      const { prisma } = ctx;

      const brand = await prisma.brand.create({
        data: createBrandBody,
      });

      return brand;
    }),

  getBrandById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      const brand = await prisma.brand.findFirstOrThrow({
        where: {
          id,
        },
      });

      return brand;
    }),

  deleteBrand: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      const brand = await prisma.brand.findFirstOrThrow({
        where: {
          id,
        },
      });

      await prisma.brand.delete({
        where: {
          id,
        },
      });
    }),

  updateBrand: adminProcedure
    .input(z.object({ patch: z.any(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { patch, id } = input;

      const brand = await prisma.brand.findUniqueOrThrow({
        where: {
          id,
        },
      });

      const updatedBrand = applyPatch(brand, patch).newDocument;

      const brandBody: Omit<Brand, "id"> = { ...updatedBrand };

      const newBrand = await prisma.brand.update({
        where: {
          id,
        },
        data: brandBody,
      });

      return newBrand;
    }),

  getAllBrandsMeta: adminProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor } = input;

      const page = cursor ?? 1;

      const { prisma } = ctx;

      const limit = 50;

      const skip = (page - 1) * limit;

      const brands = await prisma.brand.findMany({
        take: limit + 1,
        skip,
        select: {
          id: true,
          name: true,
        },
      });

      const nextCursor = brands.length > limit ? page + 1 : null;

      return { brands, nextCursor, page };
    }),

  getSpecialOffers: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const brands = await prisma.brand.findMany({
      where: {
        image: {
          not: "",
        },
      },

      take: 6,
    });

    return brands;
  }),
});
