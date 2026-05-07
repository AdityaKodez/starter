import { Button } from "@/components/ui/button";


export const metadata = {
    title: "Dashboard",
    description: "View your study plans, track progress, and access resources on your personalized dashboard.",
}

export const DashboardContent = () => {
    return (
        <div className="w-full flex flex-col items-start justify-start gap-4">
            <h2 className="font-display text-xl font-semibold tracking-tighter leading-tight">
                Your Study Plans
            </h2>
            <p className="text-muted-foreground text-sm">
                Here you can view and manage your study plans. Click on a plan to see details, track your progress, and access resources.
            </p>    
            <Button variant={"outline"}>View Study Plans</Button>
        </div>
    )
}
