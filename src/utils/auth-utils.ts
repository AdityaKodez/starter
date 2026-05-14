import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
export const requireAuth = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return session;
});

export const requireUnauth = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }
});


export const requireOnboarding = cache(async () => {
const session =  await requireAuth();
const onboarding = await prisma.onboarding.findUnique({
  where: {
    userId: session.user.id,
  },
});
if (!onboarding) {
  redirect("/onboarding");
}
});