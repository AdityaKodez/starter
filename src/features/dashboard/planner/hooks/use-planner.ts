import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const usePlannerQueryOptions = () => {
    const trpc = useTRPC();
    return trpc.planner.generateToday.queryOptions();
};

export const useFetchPlanner = () => {
    const queryOptions = usePlannerQueryOptions();
    return useSuspenseQuery(queryOptions);
};