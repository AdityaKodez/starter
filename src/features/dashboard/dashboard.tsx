"use client";
import { Planner } from "./planner/planner";
import { StudyStatsCard } from "./study-stats-card";
import { TestResultsCard } from "./test-results-card";
export const metadata = {
    title: "Dashboard",
    description: "View your study plans, track progress, and access resources on your personalized dashboard.",
}

export const DashboardContent = () => {
    return (
        <div className="w-full flex flex-col items-start justify-start gap-4">
                    <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                        <Planner />
                        <div className="flex flex-col gap-4">
                            <StudyStatsCard />
                            <TestResultsCard />
                        </div>
                    </div>
         
        </div>
    )
}
