import { createTRPCRouter, publicProcedure, operatorProcedure, vendorAndOperatorProcedure, vendorProcedure } from "@/trpc/init";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const vendorRouter = createTRPCRouter({
    // Create vendor - restricted (admin or vendors). Kept simple for now.
    createVendor: operatorProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional()
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.vendor.create({ data: input });
        }),

    // Public listings with optional search / pagination
    list: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0)
        }))
        .query(({ ctx, input }) => {
            const where: any = input.q ? {
                OR: [{
                    name: { contains: input.q, mode: "insensitive" }
                },
                { description: { contains: input.q, mode: "insensitive" } }
                ]
            } : {};

            return ctx.prisma.vendor.findMany({ where, take: input.take, skip: input.skip, orderBy: { createdAt: "desc" } });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({ where: { id: input.id }, include: { products: true } });
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({ where: { slug: input.slug }, include: { products: true } });
        }),

    // Get a single product item by ID
    getProductItemById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.productItem.findUnique({
                where: { id: input.id },
                include: { product: true, vendor: true }
            });
        }),

    // Get multiple product items by IDs (for batch fetching)
    getProductItemsByIds: publicProcedure
        .input(z.object({ ids: z.array(z.string()) }))
        .query(({ ctx, input }) => {
            if (input.ids.length === 0) return [];
            return ctx.prisma.productItem.findMany({
                where: { id: { in: input.ids } },
                include: { product: true, vendor: true }
            });
        }),

    // Get product by ID with all its items (variants)
    getProductWithItems: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.product.findUnique({
                where: { id: input.id },
                include: {
                    items: { where: { isActive: true }, orderBy: { price: "asc" } },
                    vendor: true
                }
            });
        }),

    // Get product items for addons (from same vendor, excluding specific product items)
    getAddonProductItems: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            excludeProductItemIds: z.array(z.string()).optional(),
            take: z.number().optional().default(50)
        }))
        .query(({ ctx, input }) => {
            const where: any = {
                vendorId: input.vendorId,
                isActive: true,
                inStock: true
            };
            if (input.excludeProductItemIds && input.excludeProductItemIds.length > 0) {
                where.id = { notIn: input.excludeProductItemIds };
            }
            return ctx.prisma.productItem.findMany({
                where,
                take: input.take,
                orderBy: { name: "asc" }
            });
        }),

    // Product item listing for a vendor
    listProductItems: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            take: z.number().optional().default(50)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.productItem.findMany({ where: { vendorId: input.vendorId, isActive: true }, take: input.take, orderBy: { createdAt: "desc" } });
        }),

    // Combined search for vendors and product items
    search: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            categoryId: z.string().optional(),
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0),
        }))
        .query(async ({ ctx, input }) => {
            const vendorWhere: any = {};
            if (input.q) {
                vendorWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            if (input.categoryId) {
                vendorWhere.vendorCategories = { some: { categoryId: input.categoryId } };
            }

            const productWhere: any = { isActive: true };
            if (input.q) {
                productWhere.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } },
                ];
            }
            if (input.categoryId) {
                productWhere.categories = { some: { categoryId: input.categoryId } };
            }

            const [vendors, products] = await Promise.all([
                ctx.prisma.vendor.findMany({ where: vendorWhere, take: input.take, skip: input.skip, orderBy: { createdAt: "desc" } }),
                ctx.prisma.productItem.findMany({ where: productWhere, take: input.take, skip: input.skip, orderBy: { createdAt: "desc" } }),
            ]);

            return { vendors, products };
        }),

    // List vendors by approximate area using lat/lng bounding box
    listVendorsByArea: publicProcedure
        .input(z.object({
            lat: z.number(),
            lng: z.number(),
            radiusKm: z.number().optional().default(5),
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0),
        }))
        .query(({ ctx, input }) => {
            const delta = input.radiusKm / 111; // ~degrees per km
            const latMin = input.lat - delta;
            const latMax = input.lat + delta;
            const lngMin = input.lng - delta;
            const lngMax = input.lng + delta;

            return ctx.prisma.vendor.findMany({
                where: {
                    lat: { gte: latMin, lte: latMax },
                    lng: { gte: lngMin, lte: lngMax },
                    // only active vendors assumed
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
            });
        }),



    // ========== VENDOR DASHBOARD PROCEDURES ==========

    // Get vendor owned by current user
    getMyVendor: vendorProcedure.query(async ({ ctx }) => {
        const userId = ctx.user!.id;
        const vendor = await ctx.prisma.vendor.findFirst({
            where: { ownerId: userId },
            include: {
                products: {
                    include: {
                        items: {
                            where: { isActive: true },
                            orderBy: { createdAt: "desc" }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                _count: {
                    select: {
                        orders: true,
                        productItems: true,
                    }
                }
            }
        });
        return vendor;
    }),

    // Update vendor profile (only owner can update)
    updateMyVendor: vendorProcedure
        .input(
            z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().email().optional(),
                address: z.string().optional(),
                city: z.string().optional(),
                country: z.string().optional(),
                coverImage: z.string().url().optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found or you don't own a vendor");

            return ctx.prisma.vendor.update({
                where: { id: vendor.id },
                data: input
            });
        }),

    // Get vendor's products with items
    getMyProducts: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0)
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            return ctx.prisma.product.findMany({
                where: { vendorId: vendor.id },
                include: {
                    items: {
                        orderBy: { createdAt: "desc" }
                    }
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    // Get vendor's product items
    getMyProductItems: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0),
                productId: z.string().optional()
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const where: any = { vendorId: vendor.id };
            if (input.productId) {
                where.productId = input.productId;
            }

            return ctx.prisma.productItem.findMany({
                where,
                include: {
                    product: true,
                    categories: {
                        include: { category: true }
                    }
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    // Get vendor's orders
    getMyOrders: vendorProcedure
        .input(
            z.object({
                take: z.number().optional().default(50),
                skip: z.number().optional().default(0),
                status: z.enum(Object.values(OrderStatus)).optional()
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const where: any = { vendorId: vendor.id };
            if (input.status) {
                where.status = input.status;
            }

            return ctx.prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    address: true,
                    items: {
                        include: {
                            productItem: true,
                            addons: {
                                include: {
                                    addonProductItem: true
                                }
                            }
                        }
                    },
                    payment: true
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    // Create a standalone product (vendor-level). Permission: vendor owner, operator, or super admin.
    createProduct: vendorAndOperatorProcedure
        .input(z.object({
            vendorId: z.string(),
            name: z.string(),
            // slug: z.string(),
            description: z.string().optional(),
            inStock: z.boolean().optional().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx!.user!.id;

            // fetch vendor to validate ownership
            const vendor = await ctx.prisma.vendor.findUnique({
                where: { id: input.vendorId }
            });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.product.create({
                data: {
                    vendorId: input.vendorId,
                    name: input.name,
                    // slug: input.slug,
                    description: input.description,
                    inStock: input.inStock
                }
            });
        }),

    // Create/Update product items (vendor/operator/admin). Now permission-checked to allow vendor owners as well.
    createProductItem: vendorAndOperatorProcedure
        .input(
            z.object({
                vendorId: z.string(),
                productId: z.string().optional(),
                name: z.string(),
                slug: z.string(),
                description: z.string().optional(),
                price: z.number(),
                currency: z.string().optional().default("NGN"),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional().default(true),
                inStock: z.boolean().optional().default(true),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: input.vendorId } });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.productItem.create({ data: { ...input } });
        }),

    // Create a product together with multiple variants (productItems) in a transaction.
    // Input allows providing an array of variants each with its own price.
    createProductWithItems: vendorAndOperatorProcedure
        .input(z.object({
            vendorId: z.string(),
            product: z.object({
                name: z.string(),
                slug: z.string(),
                description: z.string().optional()
            }),
            items: z.array(
                z.object({
                    name: z.string(),
                    slug: z.string(),
                    description: z.string().optional(),
                    price: z.number(),
                    currency: z.string().optional().default("NGN"),
                    images: z.array(z.string()).optional(),
                    isActive: z.boolean().optional().default(true),
                    inStock: z.boolean().optional().default(true)
                }))
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: input.vendorId } });
            if (!vendor) throw new Error("Vendor not found");

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.$transaction(async (prisma) => {
                const createdProduct = await prisma.product.create({
                    data: {
                        vendorId: input.vendorId,
                        name: input.product.name,
                        // slug: input.product.slug, 
                        description: input.product.description
                    }
                });

                for (const it of input.items) {
                    await prisma.productItem.create({ data: { vendorId: input.vendorId, productId: createdProduct.id, name: it.name, slug: it.slug, description: it.description, price: it.price, currency: it.currency, images: it.images, isActive: it.isActive, inStock: it.inStock } });
                }

                return prisma.product.findUnique({ where: { id: createdProduct.id }, include: { items: true } });
            });
        }),

    updateProductItem: vendorAndOperatorProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                price: z.number().optional(),
                currency: z.string().optional(),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional(),
                inStock: z.boolean().optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            // allow vendor owner, operator, or super admin to update
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const item = await ctx.prisma.productItem.findUnique({ where: { id: input.id } });
            if (!item) throw new Error("ProductItem not found");

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: item.vendorId } });

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor && vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.productItem.update({ where: { id: input.id }, data: input.data });
        }),

    updateProduct: vendorAndOperatorProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                inStock: z.boolean().optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user) throw new Error("Unauthorized");
            const userId = ctx.user.id;

            const product = await ctx.prisma.product.findUnique({ where: { id: input.id } });
            if (!product) throw new Error("Product not found");

            const vendor = await ctx.prisma.vendor.findUnique({ where: { id: product.vendorId } });

            const isOperator = await ctx.prisma.userRole.findFirst({ where: { userId, role: "OPERATOR" } });
            const isSuper = await ctx.prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
            const isVendorOwner = vendor && vendor.ownerId === userId;

            if (!isOperator && !isSuper && !isVendorOwner) throw new Error("Forbidden: insufficient permissions");

            return ctx.prisma.product.update({ where: { id: input.id }, data: input.data });
        }),

    // Delete product item (vendor only)
    deleteProductItem: vendorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const item = await ctx.prisma.productItem.findUnique({
                where: { id: input.id },
                include: { vendor: true }
            });
            if (!item) throw new Error("Product item not found");
            if (item.vendor.ownerId !== userId) {
                throw new Error("Unauthorized: You don't own this product item");
            }

            // Soft delete by setting isActive to false
            return ctx.prisma.productItem.update({
                where: { id: input.id },
                data: { isActive: false }
            });
        }),

    // Delete product (vendor only)
    deleteProduct: vendorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const product = await ctx.prisma.product.findUnique({
                where: { id: input.id },
                include: { vendor: true }
            });
            if (!product) throw new Error("Product not found");
            if (product.vendor.ownerId !== userId) {
                throw new Error("Unauthorized: You don't own this product");
            }

            // Soft delete by setting inStock to false for all items
            await ctx.prisma.productItem.updateMany({
                where: { productId: input.id },
                data: { isActive: false, inStock: false }
            });

            return ctx.prisma.product.update({
                where: { id: input.id },
                data: { inStock: false }
            });
        }),
});
