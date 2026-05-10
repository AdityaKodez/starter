"use client"
import { EmptyState } from "@/components/entity-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCheck,
  IconClock12,
  IconRefresh,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClockIcon } from "lucide-react";
import { useState } from "react";
import { TestResultDialog } from "./component/test-result-dialog";
import { useFetchPlanner, usePlannerQueryOptions } from "./hooks/use-planner";

type PlannerData = NonNullable<ReturnType<typeof useFetchPlanner>["data"]>;

function getTaskTypeMeta(type: PlannerData["tasks"][number]["type"]) {
  if (type === "revision") {
    return {
      label: "Revision",
      icon: IconRefresh,
     
    };
  }

  if (type === "test") {
    return {
      label: "Test",
      icon: IconClipboardCheck,
     
    };
  }

  return {
    label: "Study",
    icon: IconBook2,
    
  };
}

export const Planner = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const plannerQueryOptions = usePlannerQueryOptions();
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialogIntent, setResultDialogIntent] = useState<"complete" | "edit">("edit");
  const [resultTask, setResultTask] = useState<PlannerData["tasks"][number] | null>(null);
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
  const updateTestResultMutation = useMutation(
    trpc.planner.updateTestResult.mutationOptions({
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
                  ? { ...task, testResult: input.testResult }
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
                  ? { ...task, testResult: data.testResult }
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
  const isSavingResult = updateTestResultMutation.isPending || updateTaskMutation.isPending;

  function getDurationColor(minutes: number) {
    if (minutes < 30) return "text-green-600";
    if (minutes < 60) return "text-yellow-600";
    return "text-red-600";
  }

  function openResultDialog(task: PlannerData["tasks"][number], intent: "complete" | "edit") {
    setResultTask(task);
    setResultDialogIntent(intent);
    setResultDialogOpen(true);
  }

  function closeResultDialog() {
    setResultDialogOpen(false);
    setResultTask(null);
    setResultDialogIntent("edit");
  }

  function handleResultDialogChange(open: boolean) {
    if (!open) {
      closeResultDialog();
      return;
    }
    setResultDialogOpen(true);
  }

  function handleSaveResult(result: string | null) {
    if (!resultTask) return;
    updateTestResultMutation.mutate({
      taskId: resultTask.id,
      testResult: result,
    });
    if (result && resultTask.status !== "done") {
      updateTaskMutation.mutate({
        taskId: resultTask.id,
        status: "done",
      });
    }
    closeResultDialog();
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
              const isSkipped = task.status === "skipped";
              const isInactive = isDone || isSkipped;
              const taskType = getTaskTypeMeta(task.type);
              const TaskTypeIcon = taskType.icon;
              return (
              <li key={task.id} className="flex items-start gap-2 py-3">
                {task.type === "test" ? (
                  <div className="mt-0.5 size-4" aria-hidden="true" />
                ) : (
                  <Checkbox
                    className="mt-0.5 cursor-pointer"
                    checked={isDone}
                    aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
                    onCheckedChange={(checked) => {
                      const nextStatus = checked === true ? "done" : "pending";
                      if (task.status === nextStatus) return;
                      updateTaskMutation.mutate({
                        taskId: task.id,
                        status: nextStatus,
                      });
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                      <TaskTypeIcon className="h-3 w-3" />
                    <p
                      className={cn(
                        "text-sm font-medium text-foreground",
                        isInactive && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {isSkipped && (
                      <span className="text-[11px] text-muted-foreground">Skipped</span>
                    )}
                  </div>
                  {task.reason && (
                    <p
                      className={cn(
                        "mt-1 text-xs text-muted-foreground",
                        isInactive && "line-through",
                      )}
                    >
                      {task.reason}
                    </p>
                  )}
                  {task.type === "test" && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn(isInactive && "line-through")}>
                        {task.testResult ? `Result: ${task.testResult}` : "Result: not added"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => openResultDialog(task, "edit")}
                      >
                        {task.testResult ? "Edit result" : "Add result"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    className={cn(
                      "text-xs",
                      getDurationColor(task.durationMinutes),
                      isInactive && "text-muted-foreground",
                    )}
                  >
                    {task.durationMinutes} min
                  </span>
                  {!isDone && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-6 px-2"
                      onClick={() => {
                        updateTaskMutation.mutate({
                          taskId: task.id,
                          status: isSkipped ? "pending" : "skipped",
                        });
                      }}
                      disabled={updateTaskMutation.isPending}
                    >
                      {isSkipped ? "Undo" : "Skip"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
          </ul>
        )}
      </CardContent>
      <TestResultDialog
      key={resultTask?.id}
        open={resultDialogOpen}
        task={resultTask}
        intent={resultDialogIntent}
        isSaving={isSavingResult}
        onOpenChange={handleResultDialogChange}
        onCancel={closeResultDialog}
        onSave={handleSaveResult}
      />
    </Card>
  );
};
