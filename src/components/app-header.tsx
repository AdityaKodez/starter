import Avatar from "boring-avatars";
import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = ({
  title,
}: {
  title: string;
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 w-full justify-between items-center sm:px-6 mx-auto">
         <SidebarTrigger className="size-8" aria-label="Toggle sidebar" />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <Avatar
            name={title}
            className="size-6 "
            variant="bauhaus"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
          <h1 className="truncate text-sm tracking-tight sm:text-base ">
            {title}
          </h1>
        </div>
       
      </div>
    </header>
  );
};