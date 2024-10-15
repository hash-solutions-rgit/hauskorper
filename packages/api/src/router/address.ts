import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
// import { autoCompletePostCode, findAddress } from "../postcodes/service";
import { TRPCError } from "@trpc/server";
import Client from "getaddress-api";
import axios from "axios";

export const addressRouter = createTRPCRouter({
  getPostCodeAddress: publicProcedure
    .input(z.string())
    .query(async ({ input: postCode }) => {
      console.log("postCode", postCode);
      const postcodeApi = new Client(process.env.POSTCODE_API_KEY!);

      const findAddressResult = await postcodeApi.find(postCode);

      if (findAddressResult.isSuccess) {
        const success = findAddressResult.toSuccess();

        return success.addresses;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "No address found for the particular post code. Please check the post code again.",
        });
      }
    }),

  validatePostCode: publicProcedure
    .input(z.string())
    .mutation(async ({ input: postCode }) => {
      try {
        const isValidPostCode = await axios.get<{
          status: number;
          result: boolean;
        }>(`/${postCode}/validate`, {
          baseURL: "https://api.postcodes.io/postcodes",
        });

        return isValidPostCode.data;
      } catch (error) {
        console.error(error);
        return false;
      }
    }),
});
