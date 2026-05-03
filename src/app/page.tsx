import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { trpc, getQueryClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const queryClient = getQueryClient();
  let helloMessage = "Failed to connect to tRPC";
  try {
    helloMessage = await queryClient.fetchQuery(trpc.hello.queryOptions());
  } catch (error) {
    console.error("tRPC error:", error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 font-sans bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">Starter Template</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A barebones starter template configured with Next.js, Shadcn UI, Prisma, Better Auth, tRPC, and AI SDK.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
          <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold">tRPC Setup</h2>
            <p className="px-4 py-2 bg-muted rounded-md font-medium text-primary">
              {helloMessage}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold">Authentication</h2>
            {session?.user ? (
              <p className="text-center">
                Signed in as <span className="font-bold">{session.user.name ?? session.user.email}</span>
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground">Not signed in.</p>
                <p className="text-sm text-center">Configure Better Auth to handle sign ins.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

