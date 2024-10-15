import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {} from "@vapestation/database/schema";
import { db } from "~web/database";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db),
});
