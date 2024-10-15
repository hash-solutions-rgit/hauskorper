import { z } from "zod";
import { createTRPCRouter, adminProcedure, publicProcedure } from "../trpc";
import { Prisma } from "@vapestation/database";
import { ObjectId } from "mongodb";

const isValidObjectId = (id: string) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

export const searchRouter = createTRPCRouter({
  searchProduct: publicProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const productsRequest = prisma.product.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
          sellingPrice: true,
          inventory: {
            select: {
              quantity: true,
            },
          },
          inStock: true,
          tagSlug: true,
        },
      });

      const productsCountRequest = prisma.product.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const [products, productsCount] = await Promise.all([
        productsRequest,
        productsCountRequest,
      ]);

      return { products, count: productsCount };
    }),
  searchCategory: publicProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const categoriesRequest = prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const categoriesCountRequest = prisma.category.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const [categories, categoriesCount] = await Promise.all([
        categoriesRequest,
        categoriesCountRequest,
      ]);

      return { categories, count: categoriesCount };
    }),
  searchBrand: publicProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const brandsRequest = prisma.brand.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const brandsCountRequest = prisma.brand.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const [brands, brandsCount] = await Promise.all([
        brandsRequest,
        brandsCountRequest,
      ]);

      return { brands, count: brandsCount };
    }),

  search: publicProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const productsRequest = prisma.product.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
          sellingPrice: true,
          inventory: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const productsCountRequest = prisma.product.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const categoriesRequest = prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const categoriesCountRequest = prisma.category.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const brandsRequest = prisma.brand.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const brandsCountRequest = prisma.brand.count({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      });

      const [
        products,
        productsCount,
        categories,
        categoriesCount,
        brands,
        brandsCount,
      ] = await Promise.all([
        productsRequest,
        productsCountRequest,
        categoriesRequest,
        categoriesCountRequest,
        brandsRequest,
        brandsCountRequest,
      ]);

      return {
        products: {
          data: products,
          count: productsCount,
        },

        categories: {
          data: categories,
          count: categoriesCount,
        },

        brands: {
          data: brands,
          count: brandsCount,
        },
      };
    }),

  // for the admins
  queryProduct: adminProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma, auth } = ctx;

      const filters: Prisma.ProductWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];

      if (isValidObjectId(query)) {
        filters.push({
          id: query,
        });
      }
      if (!isNaN(parseInt(query))) {
        filters.push({
          sku: parseInt(query),
        });
      }

      const products = await prisma.product.findMany({
        where: {
          OR: filters,
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
          sellingPrice: true,
          inventory: {
            select: {
              quantity: true,
            },
          },
        },
      });

      return products;
    }),

  queryBrand: adminProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma, auth } = ctx;

      const filters: Prisma.BrandWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: query,
        },
      ];

      if (isValidObjectId(query)) {
        filters.push({
          id: query,
        });
      }

      const brands = await prisma.brand.findMany({
        where: {
          OR: filters,
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      return brands;
    }),

  queryCategory: adminProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const filters: Prisma.CategoryWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: query,
        },
      ];

      if (isValidObjectId(query)) {
        filters.push({
          id: query,
        });
      }

      const categories = await prisma.category.findMany({
        where: {
          OR: filters,
        },
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
        take: 5,
      });

      return categories;
    }),

  searchGlobal: adminProcedure
    .input(z.string().min(3))
    .query(async ({ ctx, input: query }) => {
      const { prisma } = ctx;

      const productFilters: Prisma.ProductWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];

      const categoryFilters: Prisma.CategoryWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: query,
        },
      ];

      const brandFilters: Prisma.BrandWhereInput[] = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: query,
        },
      ];

      if (isValidObjectId(query)) {
        productFilters.push({
          id: query,
        });
        categoryFilters.push({
          id: query,
        });
        brandFilters.push({
          id: query,
        });
      }

      if (!isNaN(parseInt(query))) {
        productFilters.push({
          sku: parseInt(query),
        });
      }

      const productsRequest = prisma.product.findMany({
        where: {
          OR: productFilters,
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
          sellingPrice: true,
          inventory: {
            select: {
              quantity: true,
            },
          },
        },
      });

      const categoriesRequest = prisma.category.findMany({
        where: {
          OR: categoryFilters,
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const brandsRequest = prisma.brand.findMany({
        where: {
          OR: brandFilters,
        },
        take: 5,
        select: {
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      });

      const [products, categories, brands] = await Promise.all([
        productsRequest,
        categoriesRequest,
        brandsRequest,
      ]);

      return {
        products,
        categories,
        brands,
      };
    }),
});
