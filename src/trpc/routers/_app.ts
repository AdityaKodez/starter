
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../init";
import { attachementRouter } from "./attachement";
import { mistakeRouter } from "./mistake";
import { testAttemptRouter } from "./test-attempt";

export const appRouter = createTRPCRouter({
	testAttempt: testAttemptRouter,
	attachment : attachementRouter,
	mistake: mistakeRouter,
});

export type AppRouter = typeof appRouter;
