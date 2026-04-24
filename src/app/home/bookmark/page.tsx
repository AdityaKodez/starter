import { EmptyState } from "@/components/empty-state";
import { EntityHeader } from "@/components/entity-state";
import { getHomeNavItem } from "@/lib/home-navigation";
import { IconBookmark } from "@tabler/icons-react";

export default function BookmarkPage() {
  const page = getHomeNavItem("/home/bookmark");

  return (
       <>
       <EntityHeader
         title={page.label}
         description={page.description}
       />
       <EmptyState
        icon={IconBookmark}
         title={page.label}
         description={page.description}
         
       />
       </>
  );
}
