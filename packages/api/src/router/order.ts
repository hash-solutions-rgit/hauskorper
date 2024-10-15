import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { OrderStatus } from "@vapestation/database";

export const orderRouter = createTRPCRouter({
  getOrderByCartId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: cartId }) => {
      const { prisma } = ctx;

      //   get Order by cart Id
      const order = prisma.order.findUniqueOrThrow({
        where: {
          cartId,
        },
        include: {
          products: {
            select: {
              id: true,
              orderId: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              productId: true,
              price: true,
            },
          },
        },
      });

      return order;
    }),

  getAllOrder: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { cursor, limit } = input;

      const page = cursor ?? 1;

      const take = limit ?? 10;
      const skip = (page - 1) * take;

      const orders = await prisma.order.findMany({
        take: take + 1,
        skip,
        include: {
          products: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          customer: true,
          transaction: true,
          FormMetaData: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const nextCursor = orders.length > take ? page + 1 : null;

      return {
        orders: orders.slice(0, limit),
        nextCursor,
        page,
      };
    }),

  updateOrder: protectedProcedure
    .input(
      z.object({
        status: z.enum([OrderStatus.APPROVED, OrderStatus.REJECT]),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { id, status } = input;

      let orderStatus: OrderStatus = status;

      if (status === "APPROVED") {
        orderStatus = "PROCESSING";
      }

      await prisma.order.update({
        where: { id },
        data: {
          status: orderStatus,
        },
      });
    }),

  getOrder: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: orderId }) => {
      const order = await ctx.prisma.order.findUniqueOrThrow({
        where: {
          id: orderId,
        },
        include: {
          products: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          customer: true,
          transaction: true,
          FormMetaData: true,
        },
      });

      return order;
    }),
});
