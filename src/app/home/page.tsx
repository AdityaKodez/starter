import { EmptyState } from "@/components/empty-state";
import { EntityHeader } from "@/components/entity-state";
import { getHomeNavItem } from "@/lib/home-navigation";
import { requireAuth } from "@/utils/auth-utils";
import { IconHome2 } from "@tabler/icons-react";

export default async function Home() {
  const session = await requireAuth();
  const page = getHomeNavItem("/home");
  const userName = session?.user?.name || "User";
  const dashboardTitle = `Hey, ${userName.toLowerCase()}! 👋`;
  return (
    <>
    <EntityHeader
      title={dashboardTitle}
      description={page.description}
    />
    <EmptyState
     icon={IconHome2}
      title={dashboardTitle}
      description={page.description}
      
    />
    </>
  );
}
