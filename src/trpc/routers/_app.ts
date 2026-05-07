// src/trpc/routers/_app.ts
import { createCallerFactory, createTRPCRouter } from "../init";
import { onboardingRouter } from "./onboarding";
import { plannerRouter } from "./planner";

export const appRouter = createTRPCRouter({
  onboarding: onboardingRouter,
  planner: plannerRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
