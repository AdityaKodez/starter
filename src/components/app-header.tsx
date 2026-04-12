import Avatar from "boring-avatars";
import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = ({
  title,
}: {
  title: string;
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full items-center gap-3 sm:px-6 justify-between">
        <div className="flex w-10 shrink-0 items-center justify-start">
          <SidebarTrigger className="size-8" aria-label="Toggle sidebar" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start">
          <Avatar
            name={title}
            className="size-6 "
            variant="bauhaus"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
          <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base ">
            {title}
          </h1>
        </div>
       
      </div>
    </header>
  );
};