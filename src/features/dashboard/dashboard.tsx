"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Planner } from "./planner/planner";
export const metadata = {
    title: "Dashboard",
    description: "View your study plans, track progress, and access resources on your personalized dashboard.",
}

export const DashboardContent = () => {
    return (
        <div className="w-full flex flex-col items-start justify-start gap-4">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
 <Planner/>
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Access your saved resources and materials here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Resource list or content goes here */}
          <p className="text-sm text-muted-foreground">
            You have no saved resources yet.
          </p>
          </CardContent>
          <CardFooter>
            {/* Optional footer content, such as buttons or links */}
            <Button variant="outline" size="sm">
              Explore Resources
            </Button>
          </CardFooter>
      </Card>
      
          </div>
         
        </div>
    )
}
