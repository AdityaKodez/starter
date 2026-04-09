
// src/trpc/routers/_app.ts
import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "../init";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(z.object({ text: z.string() }).optional())
    .query(({ input }) => ({
      greeting: `hello ${input?.text || "world"}`,
    })),
});

export type AppRouter = typeof appRouter;