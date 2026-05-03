// src/trpc/routers/_app.ts
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
	hello: baseProcedure.query(() => "Hello World from tRPC!"),
});

export type AppRouter = typeof appRouter;
