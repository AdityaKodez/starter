import { EmptyState } from "@/components/empty-state";
import { EntityHeader } from "@/components/entity-state";
import { getHomeNavItem } from "@/lib/home-navigation";
import { IconXFilled } from "@tabler/icons-react";

export default function MistakesPage() {
  const page = getHomeNavItem("/home/mistakes");

  return (
    <>
    <EntityHeader
      title={page.label}
      description={page.description}
    />
    <EmptyState
     icon={IconXFilled}
      title={page.label}
      description={page.description}
      
    />
    </>
  );
}
