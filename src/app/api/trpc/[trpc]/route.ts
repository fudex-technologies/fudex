import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

// Add cache headers to prevent caching of API responses
const createHandler = (method: "GET" | "POST") => async (req: Request) => {
  const response = await handler(req);

  // Add headers to prevent caching
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
};

export const GET = createHandler("GET");
export const POST = createHandler("POST");
