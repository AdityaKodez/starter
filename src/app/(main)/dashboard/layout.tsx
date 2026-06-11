import { DashboardNavigation } from "@/features/dashboard/dashboard-navigation";
import { requireOnboarding } from "@/utils/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboarding();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardNavigation user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
