"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  SidebarThemeToggle,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { homeNavItems } from "@/lib/home-navigation";
import { IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconLogo from "../../public/logo";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isActive = (href: string) =>
    href === "/home"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const creditsUsed = 72;
  const creditsTotal = 100;
  const creditsLeft = Math.max(creditsTotal - creditsUsed, 0);

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      <SidebarHeader>
        <Link className="flex items-center gap-2" href="/home" prefetch>
          <IconLogo className="size-6" />
          <p className="text-sm md:text-lg font-bold font-heading">Revind</p>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <p>Home</p>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {homeNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href} prefetch>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-3 border-t border-sidebar-border/80 p-3">
          <div className="rounded-xl bg-sidebar-accent/45 p-2.5">
            {isPending ? (
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ) : session?.user ? (
              <div className="flex items-center gap-2.5">
                <Avatar size="lg">
                  <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User avatar"} />
                  <AvatarFallback>{session.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium uppercase">{session.user.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <SidebarThemeToggle className="ml-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Not signed in</p>
                <SidebarThemeToggle />
              </div>
            )}
          </div>

          <Card size="sm" className="gap-3 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/25 py-3">
            <CardContent className="space-y-2 px-3">
              <div className="flex items-center gap-2 text-sm">
                <IconSparkles className="size-4 text-amber-400" />
                <CardTitle className="text-sm">Upgrade to Pro</CardTitle>
              </div>
              <CardDescription className="text-xs leading-relaxed">
                Unlock advanced summaries, priority processing, and more monthly credits.
              </CardDescription>
              <Button size="sm" className="w-full">
                Upgrade now
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/20 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <p className="font-medium">Credits left</p>
              <p className="text-muted-foreground">{creditsLeft}/{creditsTotal}</p>
            </div>
            <Progress value={(creditsUsed / creditsTotal) * 100} className="h-2" />
          </div>
        </div>
      </SidebarFooter>

    </Sidebar>
  );
}
