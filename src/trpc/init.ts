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

export const operatorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) throw new Error("Unauthorized");
  const userId = ctx.user.id;
  const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
  const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
  if (!isOperator && !isSuper) throw new Error("Forbidden: operator role required");
  return next({ ctx });
});

export const vendorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) throw new Error("Unauthorized");
  const userId = ctx.user.id;
  const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
  const isVendor = await ctx.prisma.userRole.findFirst({ where: { userId, role: "VENDOR" } });
  if (!isVendor && !isSuper) throw new Error("Forbidden: vendor role required");
  return next({ ctx });
});

// Procedure which allows either a vendor, an operator, or a super-admin to proceed.
export const vendorAndOperatorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) throw new Error("Unauthorized");
  const userId = ctx.user.id;
  const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
  const isVendor = await ctx.prisma.userRole.findFirst({ where: { userId, role: "VENDOR" } });
  const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
  if (!isVendor && !isOperator && !isSuper) throw new Error("Forbidden: vendor or operator role required");
  return next({ ctx });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) throw new Error("Unauthorized");
  const userId = ctx.user.id;
  const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
  if (!isSuper) throw new Error("Forbidden: super admin required");
  return next({ ctx });
});
