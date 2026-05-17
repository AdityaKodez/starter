"use client";

import { EmptyState } from "@/components/entity-component";
import { Card, CardContent, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  physics: {
    label: "Physics",
    color: "var(--chart-1)",
  },
  chemistry: {
    label: "Chemistry",
    color: "var(--chart-2)",
  },
  maths: {
    label: "Maths",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function StudyStatsCard() {
  const trpc = useTRPC();
  const statsQuery = useSuspenseQuery(
    trpc.planner.dailyStudyStats.queryOptions(),
  );
  const streakQuery = useSuspenseQuery(
    trpc.planner.streakSummary.queryOptions(),
  );
  const data = statsQuery.data;
  const streak = streakQuery.data;
  const hasData = data.some((day) => day.totalMinutes > 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Study streak</CardTitle>
        <CardAction>
          {streak.emoji} {streak.count} day{streak.count === 1 ? "" : "s"}
        </CardAction>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data} barCategoryGap={12} barGap={5}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                width={32}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar
                dataKey="physics"
                stackId="study"
                className="mt-2"
                fill="var(--color-physics)"
                stroke="var(--card)"
                strokeWidth={2}
                radius={[6, 6, 6, 6]}
              />
              <Bar
                dataKey="chemistry"
                stackId="study"
                fill="var(--color-chemistry)"
                stroke="var(--card)"
                strokeWidth={2}
                radius={[6, 6, 6, 6]}
              />
              <Bar
                dataKey="maths"
                stackId="study"
                fill="var(--color-maths)"
                stroke="var(--card)"
                strokeWidth={2}
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState title="No study data yet" description="Start adding tasks to your planner to see your study stats here." bordered />
        )}
      </CardContent>
    </Card>
  );
}
