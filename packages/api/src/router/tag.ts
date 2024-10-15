import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tagRouter = createTRPCRouter({
  getTagBySlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: slug }) => {
      const { prisma } = ctx;

      //   get the form by the slug
      const tag = await prisma.tag.findUniqueOrThrow({
        where: {
          slug,
        },
      });
    }),
});
