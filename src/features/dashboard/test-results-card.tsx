"use client";

import { EmptyState } from "@/components/entity-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Subject } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import { IconBook, IconCalendarPlus, IconCheck, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ManualTestResultDialog } from "./planner/component/manual-test-result";
import { TestDeadlineDialog } from "./planner/component/test-deadline-dialog";

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

export function TestDeadlinesCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deadlineQueryOptions = trpc.planner.upcomingTestDeadlines.queryOptions();
  const statsQueryOptions = trpc.planner.testResultStats.queryOptions();
  const deadlineQuery = useSuspenseQuery(deadlineQueryOptions);
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<{
    id: string;
    subject: Subject;
    title: string;
  } | null>(null);

  const markDeadlineDoneMutation = useMutation(
    trpc.planner.markTestDeadlineDone.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: deadlineQueryOptions.queryKey });
      },
    }),
  );

  const deadlines = deadlineQuery.data;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>Upcoming tests</CardTitle>
        <CardAction>
          <Button size="sm" variant={"secondary"} onClick={() => setDeadlineDialogOpen(true)}>
            <IconCalendarPlus />
            Add test
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">

        {deadlines.length === 0 ? (
       <EmptyState 
            icon={IconCalendarPlus}
            title="No upcoming tests"
            description="Add your test deadlines to get prep reminders and personalized study plans."
            bordered
          />
        ) : (
          <ul className="space-y-2">
            {deadlines.map((deadline) => {
              const daysUntil = differenceInCalendarDays(
                startOfDay(deadline.scheduledAt),
                startOfDay(new Date()),
              );
              const dateLabel = format(deadline.scheduledAt, "MMM d");
              const daysLabel =
                daysUntil === 0
                  ? "Today"
                  : daysUntil === 1
                    ? "Tomorrow"
                    : `${daysUntil} days`;

              return (
                <li
                  key={deadline.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{deadline.title}</p>
                      <Badge variant="secondary">
                        {deadline.subject.charAt(0).toUpperCase() + deadline.subject.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dateLabel} - {daysLabel}
                    </p>
                    {deadline.notes && (
                      <p className="text-xs text-muted-foreground">{deadline.notes}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={markDeadlineDoneMutation.isPending}
                    onClick={() => {
                      setSelectedDeadline({
                        id: deadline.id,
                        subject: deadline.subject,
                        title: deadline.title,
                      });
                      setResultDialogOpen(true);
                    }}
                  >
                    <IconCheck />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <TestDeadlineDialog
        open={deadlineDialogOpen}
        onOpenChange={setDeadlineDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: deadlineQueryOptions.queryKey });
        }}
      />
      <ManualTestResultDialog
        key={selectedDeadline?.id ?? "deadline-result"}
        open={resultDialogOpen}
        onOpenChange={(open) => {
          setResultDialogOpen(open);
          if (!open) setSelectedDeadline(null);
        }}
        initialValues={{
          subject: selectedDeadline?.subject,
          title: selectedDeadline?.title,
        }}
        onSuccess={() => {
          if (selectedDeadline) {
            markDeadlineDoneMutation.mutate({ deadlineId: selectedDeadline.id });
          }

          queryClient.invalidateQueries({ queryKey: deadlineQueryOptions.queryKey });
          queryClient.invalidateQueries({ queryKey: statsQueryOptions.queryKey });
        }}
      />
    </Card>
  );
}

export function TestResultsCard() {
  const trpc = useTRPC();
  const statsQuery = useSuspenseQuery(
    trpc.planner.testResultStats.queryOptions(),
  );
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>Test results</CardTitle>
        <CardAction>
          <Button size="sm" onClick={() => setResultDialogOpen(true)}>
            <IconPlus />
            Add result
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <EmptyState
            icon={IconBook}
            title="No test results yet"
            description="Add a test result to see performance stats here."
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
            <div className="rounded-xl border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Average Score</p>
                  <p className="text-xs text-muted-foreground">
                    Across all parsed tests
                  </p>
                </div>

               
              </div>

              <ChartContainer
                config={averageChartConfig}
                className="mx-auto aspect-square h-45"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={82}
                    strokeWidth={4}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-3xl font-bold"
                  >
                    {Math.round(averagePercent)}%
                  </text>
                  <text
                    x="50%"
                    y="62%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    average
                  </text>
                </PieChart>
              </ChartContainer>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm text-muted-foreground">Total Tests</span>
                <span className="font-semibold">{data.totalResults}</span>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-5">
                <p className="text-sm font-medium">Performance Comparison</p>
                <p className="text-xs text-muted-foreground">
                  Average vs best attempt
                </p>
              </div>

              <ChartContainer
                config={summaryChartConfig}
                className="h-35 w-full"
              >
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                  barGap={10}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="var(--color-average)" radius={8} />
                  <Bar dataKey="best" fill="var(--color-best)" radius={8} />
                </BarChart>
              </ChartContainer>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-(--color-average)" />
                    <span className="text-sm text-muted-foreground">Average</span>
                  </div>
                  <span className="font-medium">
                    {formatPercent(data.averagePercent)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-(--color-best)" />
                    <span className="text-sm text-muted-foreground">Best</span>
                  </div>
                  <span className="font-medium">
                    {formatPercent(data.bestPercent)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <ManualTestResultDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        onSuccess={() => void statsQuery.refetch()}
      />
    </Card>
  );
}
