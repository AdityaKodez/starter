"use client";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { IconMessage, IconTrendingUp2 } from "@tabler/icons-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Planner } from "./planner/planner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/entity-component";
export const metadata = {
    title: "Dashboard",
    description: "View your study plans, track progress, and access resources on your personalized dashboard.",
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
export const DashboardContent = () => {
    return (
        <div className="w-full flex flex-col items-start justify-start gap-4">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
 <Planner/>
   <Card>
         <CardHeader>
           <p className="font-xs">Study Hours</p>
         </CardHeader>
 
         <CardContent>
           <ChartContainer config={chartConfig}>
             <LineChart accessibilityLayer data={chartData}>
               <CartesianGrid vertical={false} />
               <XAxis
                 dataKey="month"
                 tickLine={false}
                 tickMargin={10}
                 axisLine={false}
                 tickFormatter={(value) => value.slice(0, 3)}
               />
               <ChartTooltip
                 cursor={false}
                 content={<ChartTooltipContent indicator="line" />}
               />
               <Line
                 dataKey="desktop"
                 stroke="var(--color-desktop)"
                 strokeWidth={2}
               />
               <Line
                 dataKey="mobile"
                 stroke="var(--color-mobile)"
                 strokeWidth={2}
               />
             </LineChart>
           </ChartContainer>
         </CardContent>
         <CardFooter className="flex flex-col gap-2 items-start">
           <div className="flex gap-2 leading-none font-medium">
             Trending up by 5.2% this month{" "}
             <IconTrendingUp2 className="h-4 w-4 text-primary" />
           </div>
           <div className="leading-none text-muted-foreground">
             Showing total visitors for the last 6 months
           </div>
         </CardFooter>
       </Card>
       <Card>
        <CardHeader>
          <CardTitle>

          <p className="text-sm">Community Feed</p>
          </CardTitle>
          <CardAction>
          <Button variant="outline" size="sm" disabled>
            Veiw All
          </Button>
        </CardAction>
        </CardHeader>
        <CardContent>
         <EmptyState  icon={IconMessage} title="No posts yet" description="The community feed will show updates and posts from your study groups. Start engaging with your groups to see content here!"  action={{
          label: "Explore Groups",
          onClick: () => {
            // Future: Navigate to groups page
          },
            variant: "default",
         }}/>
        </CardContent>
       </Card>
        
      
          </div>
         
        </div>
    )
}
