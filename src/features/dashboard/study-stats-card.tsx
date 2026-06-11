"use client";

import { EmptyState } from "@/components/entity-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";

type StudyStatsDay = {
  dateKey: string;
  date: string;
  physics: number;
  chemistry: number;
  maths: number;
  totalMinutes: number;
};

type HeatmapSubject = {
  key: "physics" | "chemistry" | "maths";
  label: string;
  color: string;
};

type HeatmapCell = {
  key: string;
  day: StudyStatsDay | null;
};

const heatmapSubjects = [
  {
    key: "physics",
    label: "Physics",
    color: "var(--chart-1)",
  },
  {
    key: "chemistry",
    label: "Chemistry",
    color: "var(--chart-2)",
  },
  {
    key: "maths",
    label: "Maths",
    color: "var(--chart-3)",
  },
] satisfies HeatmapSubject[];

const HEATMAP_CELL_SIZE_CLASS = "size-2.5";
const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
const heatmapIntensities = [0, 22, 38, 56, 78] as const;

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
};

const getHeatmapLevel = (value: number, maxValue: number) => {
  if (value <= 0 || maxValue <= 0) return 0;

  const ratio = value / maxValue;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const getHeatmapCellStyle = (color: string, level: number) => {
  if (level === 0) return undefined;

  return {
    backgroundColor: `color-mix(in oklab, ${color} ${heatmapIntensities[level]}%, var(--card))`,
  } satisfies CSSProperties;
};

const getLocalDate = (dateKey: string) => new Date(`${dateKey}T00:00:00`);

const buildHeatmapWeeks = (data: StudyStatsDay[]) => {
  const cells: HeatmapCell[] = [];
  const firstDay = data[0];
  const leadingEmptyCells = firstDay ? getLocalDate(firstDay.dateKey).getDay() : 0;

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push({ key: `empty-start-${index}`, day: null });
  }

  for (const day of data) {
    cells.push({ key: day.dateKey, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, day: null });
  }

  const weeks: HeatmapCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
};

const getMonthLabels = (weeks: HeatmapCell[][]) =>
  weeks.map((week) => {
    const firstActiveDay = week.find((cell) => cell.day)?.day;
    if (!firstActiveDay) return "";

    const date = getLocalDate(firstActiveDay.dateKey);
    return date.getDate() <= 7
      ? date.toLocaleString("en", { month: "short" })
      : "";
  });

export function StudyHeatmap({
  data,
  subjects = heatmapSubjects,
  className,
}: {
  data: StudyStatsDay[];
  subjects?: HeatmapSubject[];
  className?: string;
}) {
  const weeks = buildHeatmapWeeks(data);
  const monthLabels = getMonthLabels(weeks);
  const maxMinutes = Math.max(0, ...data.map((day) => day.totalMinutes));

  return (
    <TooltipProvider>
      <div className={cn("space-y-4 overflow-x-auto pb-1 px-1", className)}>
        <div className="w-fit min-w-full">
          <div
            className="grid gap-0.5 pl-7"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 10px)`,
            }}
          >
            {monthLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="h-4 text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            <div className="grid grid-rows-7 gap-0.5 pt-0.5">
              {weekdayLabels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="flex h-2.5 w-5 items-center justify-end text-[10px] text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, 10px)`,
              }}
            >
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-0.5">
                  {week.map((cell) => {
                    if (!cell.day) {
                      return (
                        <span
                          key={cell.key}
                          className={cn("mx-auto", HEATMAP_CELL_SIZE_CLASS)}
                          aria-hidden
                        />
                      );
                    }

                    const day = cell.day;
                    const level = getHeatmapLevel(day.totalMinutes, maxMinutes);

                    return (
                      <Tooltip key={cell.key}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`${day.date}: ${formatMinutes(day.totalMinutes)} studied`}
                            className={cn(
                              "mx-auto rounded-xs border border-border/60 transition outline-none",
                              "hover:ring-2 hover:ring-ring/35 focus-visible:ring-2 focus-visible:ring-ring",
                              HEATMAP_CELL_SIZE_CLASS,
                              level === 0 && "bg-muted/50",
                            )}
                            style={getHeatmapCellStyle("var(--chart-2)", level)}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8}>
                          <div className="grid min-w-36 gap-1.5">
                            <span className="font-medium">{day.date}</span>
                            <span className="text-background/80">
                              {day.totalMinutes > 0
                                ? `${formatMinutes(day.totalMinutes)} studied`
                                : "No study logged"}
                            </span>
                            <div className="grid gap-1 border-t border-background/20 pt-1">
                              {subjects.map((subject) => (
                                <div
                                  key={subject.key}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className="size-1.5 rounded-full"
                                      style={{ backgroundColor: subject.color }}
                                    />
                                    {subject.label}
                                  </span>
                                  <span>{formatMinutes(day[subject.key])}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-xs text-muted-foreground">Last 52 weeks</span>
          <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Less</span>
            {heatmapIntensities.map((_, index) => (
              <span
                key={index}
                className={cn("size-2.5 rounded-xs", index === 0 && "bg-muted/60")}
                style={getHeatmapCellStyle("var(--chart-2)", index)}
                aria-label={`Intensity level ${index}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

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
        <CardDescription>
          You have a {streak.emoji} {streak.count}-day study streak!
        </CardDescription>
      
      </CardHeader>
      <CardContent>
        {hasData ? (
          <StudyHeatmap data={data} />
        ) : (
          <EmptyState title="No study data yet" description="Start adding tasks to your planner to see your study stats here." bordered />
        )}
      </CardContent>
    </Card>
  );
}
