import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "@vapestation/api";
import { createTRPCContext } from "@vapestation/api";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    auth: getAuth(
      new NextRequest("https://notused.com", { headers: headers() }),
    ),
    req: new NextRequest("https://notused.com", { headers: headers() }),
  });
});

export const api = createCaller(createContext);
