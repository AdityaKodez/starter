import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 w-full justify-between items-center px-6 mx-auto">
         <SidebarTrigger className="size-8" aria-label="Toggle sidebar" />
      </div>
    </header>
  );
};