import { createTRPCRouter, publicProcedure } from "../trpc";
import { Banner } from "@vapestation/database";
import { redisClient } from "@vapestation/redis";

export const bannerRouter = createTRPCRouter({
  getBanners: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const cachedBanner = await redisClient.get("banners");

    let banners: Banner[];

    if (!cachedBanner) {
      const bannersData = await prisma.banner.findMany({});
      banners = bannersData;
      void redisClient.set("banners", JSON.stringify(banners));
    } else {
      banners = JSON.parse(cachedBanner);
    }

    return banners;
  }),
});
