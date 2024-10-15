import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { getAllCustomersSchema } from "common/schema/customer";
import { getAllCustomers } from "../utils/customer";

export const customerRouter = createTRPCRouter({
  getAllCustomers: adminProcedure
    .input(getAllCustomersSchema)
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const { page, name } = input;

      // set take and skip
      const take = 10;
      const skip = (page - 1) * take;

      //   get customers
      const customersRequestQuery = getAllCustomers(prisma, take, skip);

      // get total customers
      const totalCustomersRequest = prisma.customer.count();

      // wait for all promises to resolve
      const responses = await Promise.allSettled([
        customersRequestQuery,
        totalCustomersRequest,
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
      const customers =
        responses[0].status === "fulfilled" ? responses[0].value : [];

      const count =
        responses[1].status === "fulfilled" ? responses[1].value : 0;

      return {
        customers,
        totalCustomers: count,
        page,
        hasMore: customers.length > take,
      };
    }),

  getCustomer: protectedProcedure.query(async ({ ctx }) => {
    const { auth, prisma } = ctx;
    const user = await prisma.customer.findUniqueOrThrow({
      where: { clerkId: auth.userId },
    });
    return user;
  }),
});
