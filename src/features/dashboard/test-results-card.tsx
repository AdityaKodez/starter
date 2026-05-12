"use client";

import { useState } from "react";
import { EmptyState } from "@/components/entity-component";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useTRPC } from "@/trpc/client";
import { IconBook, IconPlus } from "@tabler/icons-react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { AddTestResultDialog } from "./add-test-result-dialog";

const averageChartConfig = {
  average: {
    label: "Average",
    color: "var(--chart-1)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const summaryChartConfig = {
  average: {
    label: "Average",
    color: "var(--chart-1)",
  },
  best: {
    label: "Best",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const formatPercent = (value: number | null) => {
  if (value === null) return "-";
  return value % 1 === 0 ? `${value.toFixed(0)}%` : `${value.toFixed(1)}%`;
};

export function TestResultsCard() {
  const trpc = useTRPC();
  const statsQuery = useSuspenseQuery(
    trpc.planner.testResultStats.queryOptions(),
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const AddResult = () => {
    return useMutation(
      trpc.planner.addManualTestResult.mutationOptions({
        onSuccess() {
          void statsQuery.refetch();
        },
      })
    );

  };
const {mutateAsync, isPending } = AddResult();
  const data = statsQuery.data;
  const hasAny = data.totalResults > 0;
  const hasParsed = data.parsedResults > 0;

  const averagePercent = data.averagePercent ?? 0;
  const bestPercent = data.bestPercent ?? 0;

  const pieData = [
    {
      name: "average",
      value: averagePercent,
      fill: "var(--color-average)",
    },
    {
      name: "remaining",
      value: Math.max(0, 100 - averagePercent),
      fill: "var(--color-remaining)",
    },
  ];

  const barData = [
    {
      name: "Results",
      average: averagePercent,
      best: bestPercent,
    },
  ];

  return (
    <>
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>Test results</CardTitle>
        <CardAction>
          <Button size="icon-sm" variant="ghost" onClick={() => setIsAddDialogOpen(true)}>
            <IconPlus />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <EmptyState
          icon={IconBook}
            title="No test results yet"
            description="Add a test result in your study plan to see performance stats here."
            action={{
            label:"Add Result",
        variant:"default",
        onClick:() => setIsAddDialogOpen(true)
            }}
            bordered
          />
        ) : !hasParsed ? (
          <EmptyState
            title="Results need a format"
            description="Use 16/20 or 80% so we can calculate your averages."
            bordered
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Average score</span>
                <span className="font-medium text-foreground">
                  {formatPercent(data.averagePercent)}
                </span>
              </div>
              <ChartContainer config={averageChartConfig} className="h-44 w-full aspect-auto">
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={2}
                  />
                </PieChart>
              </ChartContainer>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tests with results</span>
                <span className="font-medium text-foreground">
                  {data.totalResults}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Best score</span>
                <span className="font-medium text-foreground">
                  {formatPercent(data.bestPercent)}
                </span>
              </div>
              <ChartContainer config={summaryChartConfig} className="h-44 w-full aspect-auto">
                <BarChart data={barData} barCategoryGap={18} barGap={8}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    width={32}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="average"
                    fill="var(--color-average)"
                    stroke="var(--card)"
                    strokeWidth={2}
                    radius={[6, 6, 6, 6]}
                  />
                  <Bar
                    dataKey="best"
                    fill="var(--color-best)"
                    stroke="var(--card)"
                    strokeWidth={2}
                    radius={[6, 6, 6, 6]}
                  />
                </BarChart>
              </ChartContainer>
              <div className="text-xs text-muted-foreground">
                Based on {data.parsedResults} parsed result{data.parsedResults === 1 ? "" : "s"}.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    <AddTestResultDialog
      open={isAddDialogOpen}
      onOpenChange={setIsAddDialogOpen}
      isSaving={isPending}
      onSave={async (values) => {
        await mutateAsync(values);
        setIsAddDialogOpen(false);
      }}
    />
    </>
  );
}
