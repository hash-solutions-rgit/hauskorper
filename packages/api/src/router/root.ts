import { createCallerFactory, createTRPCRouter } from "../trpc";
import { bannerRouter as banner } from "./banner";
import { brandRouter as brand } from "./brand";
import { cartRouter as cart } from "./cart";
import { categoryRouter as category } from "./category";
import { customerRouter as customer } from "./customer";
import { tagRouter as tag } from "./tag";
import { productRouter as product } from "./product";
import { searchRouter as search } from "./search";
import { addressRouter as address } from "./address";
import { orderRouter as order } from "./order";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product,
  customer,
  category,
  brand,
  cart,
  banner,
  tag,
  search,
  address,
  order,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
