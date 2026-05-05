
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/init";

const createCaller = createCallerFactory(appRouter);

export async function getServerCaller() {
  const ctx = await createTRPCContext(); // your context factory
  return createCaller(ctx);
}