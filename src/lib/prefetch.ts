import { prefetch } from "@/trpc/server"    
import { trpc } from "@/trpc/server"
export const prefetchPlanner = () => {
   return prefetch(trpc.planner.generateToday.queryOptions());
}

export const prefetchStudyStats = () => {
   void prefetch(trpc.planner.dailyStudyStats.queryOptions());
   return prefetch(trpc.planner.testResultStats.queryOptions());
}