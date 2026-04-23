import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-veiwer"
import { SidebarProvider } from "@/components/ui/sidebar"
export default async function Layout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <AppSidebar />
    <main className="flex min-h-svh w-full flex-1 flex-col">
  <AppHeader />

  {children}
</main>
    </SidebarProvider>
  )
}