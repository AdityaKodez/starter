
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../init";
import { playlistRouter } from "./playlist";

export const appRouter = createTRPCRouter({
  playlist: playlistRouter,
});

export type AppRouter = typeof appRouter;