"use client";

import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { UserProfileMenu } from "@/features/dashboard/user-profile-menu";
import IconLogo from "../../../public/logo";

type DashboardNavigationProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const navItems = [];

export function DashboardNavigation({ user }: DashboardNavigationProps) {
  const pathname = usePathname();
  const displayName = user.name?.toLowerCase() ?? "there";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex  justify-between
       h-14 w-full max-w-7xl items-center gap-3 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <IconLogo className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">Aura</span>
          </div>
        </Link>

        <NavigationMenu
          viewport={false}
          className="flex-1 justify-start"
        >
          <NavigationMenuList className="flex-1 justify-start gap-1">
          </NavigationMenuList>
        </NavigationMenu>

        <div className=" flex items-center gap-2">
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            {`Welcome back, ${displayName}`}
          </span>
          <UserProfileMenu name={user.name} email={user.email} image={user.image} />
        </div>
      </div>
    </header>
  );
}
