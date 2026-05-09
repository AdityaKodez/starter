"use client"
import { EmptyState } from "@/components/entity-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { IconChevronLeft, IconChevronRight, IconClock12, IconPencil } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClockIcon } from "lucide-react";
import { useFetchPlanner, usePlannerQueryOptions } from "./hooks/use-planner";

type PlannerData = NonNullable<ReturnType<typeof useFetchPlanner>["data"]>;

export const Planner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const plannerQueryOptions = usePlannerQueryOptions();
  const updateTaskMutation = useMutation(
    trpc.planner.updateTaskStatus.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({
          queryKey: plannerQueryOptions.queryKey,
        });

        const previous = queryClient.getQueryData<PlannerData>(
          plannerQueryOptions.queryKey,
        );

        queryClient.setQueryData<PlannerData>(
          plannerQueryOptions.queryKey,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              tasks: old.tasks.map((task) =>
                task.id === input.taskId
                  ? { ...task, status: input.status }
                  : task,
              ),
            };
          },
        );

        return { previous };
      },
      onError: (_err, _input, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            plannerQueryOptions.queryKey,
            context.previous,
          );
        }
      },
      onSuccess: (data) => {
        queryClient.setQueryData<PlannerData>(
          plannerQueryOptions.queryKey,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              tasks: old.tasks.map((task) =>
                task.id === data.id
                  ? { ...task, status: data.status }
                  : task,
              ),
            };
          },
        );
      },
    }),
  );

  const plannerQuery = useFetchPlanner();
  const planner = plannerQuery.data;
  const taskCount = planner.tasks.filter((task) => task.status === "pending").length;
  const totalMinutes = planner.totalMinutes ?? planner.tasks.reduce((sum, task) => sum + task.durationMinutes, 0);

 function getDurationColor(minutes: number) {
    if (minutes < 30) return "text-green-600";
    if (minutes < 60) return "text-yellow-600";
    return "text-red-600";
  }
  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
          <CardTitle className="text-base sm:text-lg">Today&apos;s Study Plan</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="default">{taskCount} tasks</Badge>
            <Badge variant="secondary" className=" flex items-center gap-1">
                <IconClock12 className="h-3 w-3" />
                {totalMinutes} min</Badge>
          </CardDescription>

      <CardAction className=" flex gap-2">  
        
        {/* Button of editing the Plan */}
        <Button variant="outline" size="icon-sm" disabled>
         <IconPencil className="h-4 w-4" />
        </Button>
        {/* Future: Add "Back and Forth" button here */}
       
          <Button variant="outline" size="icon-sm" disabled>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" disabled>
            <IconChevronRight className="h-4 w-4" />
          </Button>
     
      </CardAction>
      </CardHeader>
      <CardContent>
        {planner.tasks.length === 0 ? (
          <EmptyState icon={ClockIcon} title="No tasks for today" description="You have no tasks scheduled for today. Enjoy your free time or add some tasks to your planner!" />
        ) : (
          <ul className="divide-y divide-border/60">
            {planner.tasks.map((task) => {
              const isDone = task.status === "done";
              return (
              <li key={task.id} className="flex items-start gap-3 py-3">
                <Checkbox
                  className="mt-0.5 cursor-pointer"
                  checked={isDone}
                  aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
                  onCheckedChange={(checked) => {
                    const nextStatus = checked ? "done" : "pending";
                    if (task.status === nextStatus) return;
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      status: nextStatus,
                    });
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      isDone && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.reason && (
                    <p
                      className={cn(
                        "text-xs text-muted-foreground",
                        isDone && "line-through",
                      )}
                    >
                      {task.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    className={cn(
                      "text-xs",
                      getDurationColor(task.durationMinutes),
                      isDone && "text-muted-foreground",
                    )}
                  >
                    {task.durationMinutes} min
                  </span>
                </div>
              </li>
            );
          })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
