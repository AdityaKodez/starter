import { EntityHeader } from "@/components/entity-state";
import { FileUpload } from "@/features/upload/file-upload";
import { getHomeNavItem } from "@/lib/home-navigation";
import { requireAuth } from "@/utils/auth-utils";

export default async function Home() {
  const session = await requireAuth();
  const page = getHomeNavItem("/home");
  const userName = session?.user?.name || "User";
  const dashboardTitle = `Hey, ${userName.toLowerCase()}! 👋`;
  return (
    <section className="px-4 sm:px-6 lg:px-8">
    <EntityHeader
      title={dashboardTitle}
      description={page.description}
    />
      <FileUpload />
    </section>
  
  );
}
