import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-veiwer"
import { AppHeader } from "@/components/app-header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
    <main className="flex min-h-svh w-full flex-1 flex-col">
  <AppHeader title="Viewer" />
  {children}
</main>
    </SidebarProvider>
  )
}