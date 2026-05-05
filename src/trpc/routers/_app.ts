// src/trpc/routers/_app.ts
import { createCallerFactory, createTRPCRouter } from "../init";
import { onboardingRouter } from "./onboarding";

export const appRouter = createTRPCRouter({
  onboarding: onboardingRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
