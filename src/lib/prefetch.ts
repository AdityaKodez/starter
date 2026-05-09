import { prefetch } from "@/trpc/server"    
import { trpc } from "@/trpc/server"
export const prefetchPlanner = () => {
   return prefetch(trpc.planner.generateToday.queryOptions());
}