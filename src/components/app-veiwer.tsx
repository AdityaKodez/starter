"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { VideoProgress } from "@/features/playlist/component/video-progress";
import { usePlaylistById } from "@/features/playlist/hooks/use-playlist";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconLoader
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { IconBookOpen } from "nucleo-glass";
import IconLogo from "../../public/logo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const playlistId = typeof params?.id === "string" ? params.id : undefined;
  const { data: playlist, isLoading } = usePlaylistById(playlistId);
  const { data: session } = useSession();


 function getStatusPrefix(status: string) {
  if (status === "COMPLETED") return <IconCheck size={16} />;
  if (status === "PROCESSING") return <IconLoader size={16} className="animate-spin" />;
  if (status === "FAILED") return <IconAlertTriangleFilled size={16} className="text-red-400" />;

}

  const getStatusClassName = (status: string) =>
    cn(
      "truncate text-sm",
      status === "COMPLETED" && "text-emerald-400",
      status === "PROCESSING" && "text-amber-400",
      status === "FAILED" && "text-red-400",
      status === "PENDING" && "text-muted-foreground"
    );

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="flex items-center gap-2" href="/" prefetch>
          <IconLogo className="size-6" />
          <p className="text-sm md:text-lg font-bold font-heading">Corusa</p>
        </Link>
       
      </SidebarHeader>
      <SidebarContent>
       
        <SidebarGroup>
             <VideoProgress progress={10} total={playlist?.videos.length || 0}  isLoading={isLoading}/>
            <SidebarGroupLabel>
                <p>Lessons</p>
            </SidebarGroupLabel>
        
         <SidebarGroupContent>
            <SidebarMenu>
              {!playlistId ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>No playlist selected</SidebarMenuButton>
                </SidebarMenuItem>
              ) : isLoading ? (
                   Array.from({ length: 10 }).map((_, index) => (
                        <SidebarMenuItem key={index}>
                        <SidebarMenuSkeleton />
                     </SidebarMenuItem>
                ))
                
                
              ) : playlist?.lessons?.length ? (
                playlist.lessons.map((lesson, index) => (
                  <Collapsible defaultOpen={index === 0} key={lesson.id} className="mb-1">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <IconBookOpen size={16} className="mr-2" />
                          <span className="font-medium">{lesson.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-1">
                        <SidebarMenuSub>
                          {lesson.videos.map((video) => (
                            <SidebarMenuSubItem key={video.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/viewer/${playlistId}/video/${video.id}`}
                                className={getStatusClassName(video.status)}
                              >
                                <Link href={`/viewer/${playlistId}/video/${video.id}`} className="w-full" prefetch>
                                  <span>{getStatusPrefix(video.status)}</span>
                                  <span className="text-xs">{video.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))
              ) : playlist?.videos?.length ? (
                playlist.videos.map((video) => (
                  <SidebarMenuItem key={video.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/viewer/${playlistId}/video/${video.id}`}
                      className={getStatusClassName(video.status)}
                    >
                      <Link href={`/viewer/${playlistId}/video/${video.id}`} className="w-full h-full" prefetch>
                        <span>{getStatusPrefix(video.status)}</span>
                        <span>{video.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>No videos in this playlist yet</SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
         </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {session?.user ? (
              <div className="flex items-center gap-3 rounded-md border bg-card px-2 py-2">
                <Avatar className="size-8">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || "User avatar"}
                  />
                  <AvatarFallback>
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm">{session.user.name.toLowerCase() || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
            ) : (
              <SidebarMenuButton disabled>Not signed in</SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}