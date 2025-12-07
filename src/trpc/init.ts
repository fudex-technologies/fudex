import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { headers } from "next/headers"; // only headers needed
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session, // null if not logged in
    user: session?.user ?? null,
    prisma,
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  // 🧩 Custom error formatter
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new Error("Unauthorized");
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new Error("Unauthorized");
  }
  // if (ctx.user.role !== "ADMIN") {
  //   throw new Error("Unauthorized: Only admin can access this router");
  // }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});
