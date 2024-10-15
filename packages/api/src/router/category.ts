import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import {
  createCategorySchema,
  getAllCategoriesSchema,
} from "common/schema/category";
import { Brand, Category, Prisma, Product } from "@vapestation/database";
import { applyPatch } from "fast-json-patch";

export const categoryRouter = createTRPCRouter({
  getAllCategories: publicProcedure
    .input(getAllCategoriesSchema)
    .query(async ({ ctx, input }) => {
      const { cursor, limit: itemLimit } = input;

      const page = cursor ?? 1;

      const { prisma } = ctx;

      const limit = itemLimit ?? 10;
      const skip = (page - 1) * limit;

      const categories = await prisma.category.findMany({
        take: limit + 1,
        skip,
      });

      const nextCursor = categories.length > limit ? page + 1 : null;

      return {
        categories: categories.slice(0, limit),
        nextCursor,
        page,
      };
    }),

  addCategory: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, slug, description, parentCategoryId, image } = input;

      const { prisma } = ctx;

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          description,
          parentCategoryId,
          image,
        },
      });

      return category;
    }),

  getAllCategoriesId: adminProcedure
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

      const categories = await prisma.category.findMany({
        take: limit + 1,
        skip,
        where: {
          parentCategoryId: null,
        },
        select: {
          id: true,
          name: true,
          parentCategoryId: true,
        },
      });

      const modifiedCategories = new Map<
        string,
        Pick<Category, "id" | "name" | "parentCategoryId"> & {
          children: Pick<Category, "id" | "name" | "parentCategoryId">[];
        }
      >();

      categories.forEach((category) => {
        modifiedCategories.set(category.id, { ...category, children: [] });
      });

      categories.forEach((category) => {
        if (category.parentCategoryId) {
          modifiedCategories
            .get(category.parentCategoryId)
            ?.children.push(category);
        }
      });

      const modifiedCategoriesArray = Array.from(
        modifiedCategories.values(),
      ).filter((category) => !category.parentCategoryId);

      const nextCursor = categories.length > limit ? page + 1 : null;

      return { categories: modifiedCategoriesArray, nextCursor, page };
    }),

  getAllCategoriesMeta: adminProcedure.query(async ({ ctx, input }) => {
    const { prisma } = ctx;

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentCategoryId: true,
      },
    });

    return categories;
  }),

  getCategoryById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      const category = await prisma.category.findFirstOrThrow({
        where: {
          id,
        },
      });

      return category;
    }),

  deleteCategory: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      const category = await prisma.category.findFirstOrThrow({
        where: {
          id,
        },
      });

      await prisma.category.delete({
        where: {
          id,
        },
      });
    }),

  updateCategory: adminProcedure
    .input(z.object({ patch: z.any(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { patch, id } = input;

      const category = await prisma.category.findUniqueOrThrow({
        where: {
          id,
        },
      });

      const updatedCategory = applyPatch(category, patch).newDocument;

      const categoryBody: Omit<Category, "id"> = { ...updatedCategory };

      const newCategory = await prisma.category.update({
        where: {
          id,
        },
        data: categoryBody,
      });

      return newCategory;
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const categories = await prisma.category.findMany({
      take: 12,
    });

    return categories;
  }),

  getCategoryBySlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: slug }) => {
      const { prisma } = ctx;

      const category = await prisma.category.findFirstOrThrow({
        where: {
          slug,
        },
        include: {
          products: {
            where: {
              isDeleted: false,
              status: "PUBLISHED",
            },
          },
        },
      });

      const childrenCategories = await prisma.category.findMany({
        where: {
          parentCategoryId: category.id,
        },
        select: {
          id: true,
          image: true,
          description: true,
          name: true,
          slug: true,
          products: {
            where: {
              isDeleted: false,
              status: "PUBLISHED",
            },
          },
        },
      });

      // if (slug === "shop-brands-a-z") {
      //   const brands = await prisma.brand.findMany({
      //     orderBy: {
      //       name: "asc",
      //     },
      //     select: {
      //       id: true,
      //       image: true,
      //       description: true,
      //       name: true,
      //       slug: true,
      //       product: {
      //         where: {
      //           isDeleted: false,
      //           status: "PUBLISHED",
      //         },
      //       },
      //     },
      //   });

      //   const modifiedBrands = brands.map((brand) => ({
      //     ...brand,
      //     products: brand.product,
      //   }));
      //   return { ...category, childrenCategories: modifiedBrands };
      // }

      return { ...category, childrenCategories };
    }),

  getCategoryMenu: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const categoriesSlug = [
      "pharmacy",
      "by-condition",
      "vitamins",
      "sexual-wellbeing",
      "dental",
      "pound-range",
    ];

    const categories = await Promise.all(
      categoriesSlug.map(async (slug) => {
        return await prisma.category.findUniqueOrThrow({
          where: {
            slug,
          },
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
            children: {
              select: {
                id: true,
                slug: true,
                name: true,
                image: true,
              },
              take: 10,
            },
          },
        });
      }),
    );

    return categories;
  }),
});
