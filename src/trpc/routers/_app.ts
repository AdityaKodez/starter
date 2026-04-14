
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../init";
import { playlistRouter } from "./playlist";
import { videoRouter } from "./video";

export const appRouter = createTRPCRouter({
  playlist: playlistRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;