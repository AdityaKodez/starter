import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import IconLogo from "../../public/logo"
import { Button } from "./ui/button"
import { IconArrowDown } from "@tabler/icons-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <IconLogo className="size-6" />
          <p className="text-sm md:text-lg font-bold font-heading">Corusa</p>
        </div>
       
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>
                <p>Lessons</p>
            </SidebarGroupLabel>
         <SidebarGroupAction asChild>
            <Button variant="secondary" size="sm">
                New Lesson
            </Button>
         </SidebarGroupAction>
         <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <p>Lesson 1: Introduction to React</p>
                    <SidebarMenuAction asChild>
                      <Button variant="ghost" size="icon-xs">
                       <IconArrowDown className="size-4 mr-2" />
                      </Button>
                    </SidebarMenuAction>

                </SidebarMenuItem>
            </SidebarMenu>
            {/* List of lessons will go here */}
         </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}