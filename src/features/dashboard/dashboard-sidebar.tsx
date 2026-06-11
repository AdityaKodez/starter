"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserProfileMenu } from "@/features/dashboard/user-profile-menu";
import { IconXFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconLogo from "../../../public/logo";
import { useState } from "react";

type DashboardSidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const navItems = [];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
 const [close , setClose] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
       <SidebarMenuItem>
  <SidebarMenuButton asChild size="lg">
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <IconLogo className="h-4 w-4" />
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">
          Aura
        </span>

        <span className="truncate text-xs text-muted-foreground">
          Study dashboard
        </span>
      </div>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        {
          !close && 
          <SidebarMenu>
          <SidebarMenuItem>
            <Card>
              <CardContent className="flex items-start justify-center flex-col gap-2">
            
               <div className="flex items-center justify-between gap-2 text-sm font-medium w-full">
                <div className="flex items-center gap-1">
                 <p>Upgrade to Pro </p>
                <IconPremiumRights className="size-4 text-primary"/>
                </div>
               <CardAction className="ml-auto  opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => setClose(true)}>
                  <IconXFilled className="size-3 text-muted-foreground" />
                </CardAction>
               </div>
               <p className="text-xs text-muted-foreground">
                Unlock advanced features and personalized insights to supercharge your learning journey.
               </p>
               <Button variant="default" size="xs" className="mt-2">
                Upgrade Now
               </Button>
              </CardContent>
            </Card>
            </SidebarMenuItem>
        </SidebarMenu>
        }
          
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfileMenu
              name={user.name}
              email={user.email}
              image={user.image}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
