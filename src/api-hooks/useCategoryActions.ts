"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useCategoryActions() {
    const trpc = useTRPC();

    return {
        useListCategories: (input?: { take?: number }) =>
            useQuery(trpc.categories.list.queryOptions(input ?? {})),
        useListCategoriesWithCounts: (input?: { take?: number }) =>
            useQuery(trpc.categories.listWithCounts.queryOptions(input ?? {})),
    };
}

