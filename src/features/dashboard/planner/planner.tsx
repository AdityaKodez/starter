"use client"
import { EmptyState } from "@/components/entity-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import {
  IconArrowRight,
  IconBook2,
  IconCheck,
  IconClipboardCheck,
  IconClock12,
  IconPlayerPlayFilled,
  IconRefresh
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PlanReflectionDialog } from "./component/plan-reflection-dialog";
import { PomodoroDialog } from "./component/pomodoro-dialog";
import { PomodoroTimer } from "./component/pomodoro-timer";
import type { TaskReward } from "./component/reward-burst";
import { SkipReasonDialog } from "./component/skip-reason-dialog";
import { TestResultDialog } from "./component/test-result-dialog";
import { usePomodoro, type PomodoroSettings } from "./hooks/use-pomodoro";
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
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipTask, setSkipTask] = useState<PlannerData["tasks"][number] | null>(null);
  const [pomodoroDialogOpen, setPomodoroDialogOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<PlannerData["tasks"][number] | null>(null);
  const [lastReward, setLastReward] = useState<
    ({ taskId: string } & TaskReward) | null
  >(null);
  const [dismissedReflectionPlanId, setDismissedReflectionPlanId] =
    useState<string | null>(null);
  const resolvedTimeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;
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
                  ? {
                      ...task,
                      status: input.status,
                      skipReason:
                        input.status === "skipped"
                          ? input.skipReason ?? task.skipReason ?? null
                          : null,
                    }
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
                  ? {
                      ...task,
                      status: data.status,
                      skipReason: data.skipReason ?? null,
                    }
                  : task,
              ),
            };
          },
        );
        if (data.reward) {
          setLastReward({
            taskId: data.id,
            type: data.reward.type,
            amount: data.reward.amount,
          });
          queryClient.invalidateQueries({
            queryKey: trpc.planner.getRewardBalance.queryKey(),
          });
        }
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
  const savePlanReflectionMutation = useMutation(
    trpc.planner.savePlanReflection.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData<PlannerData>(
          plannerQueryOptions.queryKey,
          (old) => {
            if (!old) return old;
            return { ...old, reflection: data };
          },
        );
      },
    }),
  );

  const pomodoro = usePomodoro({
    onWorkComplete: (taskId) => {
      updateTaskMutation.mutate({
        taskId,
        status: "done",
        timeZone: resolvedTimeZone,
      });
    },
  });

  function openPomodoroDialog(task: PlannerData["tasks"][number]) {
    setPomodoroTask(task);
    setPomodoroDialogOpen(true);
  }

  function handlePomodoroStart(settings: PomodoroSettings) {
    if (!pomodoroTask) return;
    pomodoro.start(pomodoroTask.id, settings);
    setPomodoroDialogOpen(false);
    setPomodoroTask(null);
  }

  const { data: planner } = useFetchPlanner();

  // Clear a persisted session whose task no longer exists (new day / regenerated plan).
  const sessionTaskId = pomodoro.session?.taskId;
  const sessionTaskExists =
    !sessionTaskId || planner.tasks.some((task) => task.id === sessionTaskId);
  const stopPomodoro = pomodoro.stop;
  useEffect(() => {
    if (!sessionTaskExists) {
      stopPomodoro();
    }
  }, [sessionTaskExists, stopPomodoro]);

  const plannerCategorisedBySubject = planner.tasks.reduce((acc, task) => {
    const subject = task.subject ?? "other";
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(task);
    return acc;
  }, {} as Record<string, PlannerData["tasks"]>);
  const subjectEntries = Object.entries(plannerCategorisedBySubject).sort(
    ([subjectA], [subjectB]) => {
      if (subjectA === "other") return 1;
      if (subjectB === "other") return -1;
      return subjectA.localeCompare(subjectB);
    },
  );
  const taskCount = planner.tasks.filter((task) => task.status === "pending").length;
  const totalMinutes = planner.totalMinutes ?? planner.tasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const isSavingResult = updateTestResultMutation.isPending || updateTaskMutation.isPending;
  const isSavingReflection = savePlanReflectionMutation.isPending;
  const isPlanComplete =
    planner.tasks.length > 0 &&
    planner.tasks.every(
      (task) => task.status === "done" || task.status === "skipped",
    );
  const hasReflection = Boolean(planner.reflection);
  const shouldPromptReflection =
    Boolean(planner.id) &&
    isPlanComplete &&
    !hasReflection &&
    planner.id !== dismissedReflectionPlanId;

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
        timeZone: resolvedTimeZone,
      });
    }
    closeResultDialog();
  }

  function openSkipDialog(task: PlannerData["tasks"][number]) {
    setSkipTask(task);
    setSkipDialogOpen(true);
  }

  function closeSkipDialog() {
    setSkipDialogOpen(false);
    setSkipTask(null);
  }

  function handleSkipDialogChange(open: boolean) {
    if (!open) {
      closeSkipDialog();
      return;
    }
    setSkipDialogOpen(true);
  }

  function handleSkipReasonSelect(reason: string) {
    if (!skipTask) return;
    updateTaskMutation.mutate({
      taskId: skipTask.id,
      status: "skipped",
      skipReason: reason,
      timeZone: resolvedTimeZone,
    });
    closeSkipDialog();
  }

  function handleReflectionDialogChange(open: boolean) {
    if (!open && planner.id) {
      setDismissedReflectionPlanId(planner.id);
    }
  }

  function handleReflectionSubmit(values: {
    taskFeeling: "too_easy" | "right_level" | "too_hard";
    mood: "low" | "okay" | "good";
  }) {
    if (!planner.id) return;
    savePlanReflectionMutation.mutate({
      planId: planner.id,
      taskFeeling: values.taskFeeling,
      mood: values.mood,
    });
    setDismissedReflectionPlanId(planner.id);
  }

  const regeneratePlanMutation = useMutation(
    trpc.planner.regeneratePlan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: plannerQueryOptions.queryKey,
        });
      },
    }),
  );

  function handleRegeneratePlan() {
    regeneratePlanMutation.mutate({});
  }

  return (
    <Card className="w-full shadow-none border-none ring-0">
      <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Today&apos;s Study Plan</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePlan}
              disabled={regeneratePlanMutation.isPending}
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              {regeneratePlanMutation.isPending ? "Regenerating..." : "Regenerate"}
            </Button>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="default">{taskCount} tasks</Badge>
            <Badge variant="secondary" className=" flex items-center gap-1">
                <IconClock12 className="h-3 w-3" />
                {totalMinutes} min</Badge>
      </CardDescription>
      </CardHeader>
      <CardContent>
        {planner.tasks.length === 0 ? (
          <EmptyState icon={ClockIcon} title="No tasks for today" description="You have no tasks scheduled for today. Enjoy your free time or add some tasks to your planner!" />
        ) : isPlanComplete ? (
          <div className="space-y-3">
            {pomodoro.session && (
                <PomodoroTimer
                  session={pomodoro.session}
                  remainingMs={pomodoro.remainingMs}
                  isMarkingComplete={updateTaskMutation.isPending}
                  reward={
                    lastReward?.taskId === pomodoro.session.taskId
                      ? lastReward
                      : null
                  }
                onPause={pomodoro.pause}
                onResume={pomodoro.resume}
                onStop={pomodoro.stop}
                onStartBreak={pomodoro.startBreak}
                onToggleSound={pomodoro.toggleSound}
                onMarkComplete={pomodoro.stop}
              />
            )}
            <EmptyState
              icon={IconClipboardCheck}
              title="All tasks completed"
              description="Nice work! You&apos;re done for today. Take a break or reflect on how it felt."
            />
          </div>
        ) : (
      
          <ul className="space-y-4">
            {subjectEntries.map(([subject, tasks]) => {
              const subjectLabel =
                subject === "other"
                  ? "Other"
                  : subject.charAt(0).toUpperCase() + subject.slice(1);
              return (
                <li key={subject} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{subjectLabel}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {tasks.length} tasks
                    </span>
                  </div>
                  <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                    {tasks.map((task) => {
                      const isDone = task.status === "done";
                      const isSkipped = task.status === "skipped";
                      const isInactive = isDone || isSkipped;
                      const isTimerTask = task.type !== "test" && !isSkipped;
                      const hasActiveSession = pomodoro.session !== null;
                      const isSessionTask =
                        pomodoro.session?.taskId === task.id;
                      const taskType = getTaskTypeMeta(task.type);
                      const TaskTypeIcon = taskType.icon;
                      return (
                        <li key={task.id} className="flex items-start gap-2 px-2 py-2 flex-col">
                          {isTimerTask && !isDone && !isSessionTask && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-7 rounded-full"
                              aria-label={`Start focus session for ${task.title}`}
                              disabled={hasActiveSession}
                              onClick={() => openPomodoroDialog(task)}
                            >
                              <IconPlayerPlayFilled className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isTimerTask && isDone && !isSessionTask && (
                            <Button
                              type="button"
                              variant="default"
                              size="icon"
                              className="size-7 rounded-full"
                              aria-label={`Mark ${task.title} as not done`}
                              onClick={() => {
                                updateTaskMutation.mutate({
                                  taskId: task.id,
                                  status: "pending",
                                  timeZone: resolvedTimeZone,
                                });
                              }}
                            >
                              <IconCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <TaskTypeIcon className="h-3 w-3 hidden sm:block" />
                              <p
                                className={cn(
                                  "text-sm font-medium text-foreground",
                                  isInactive &&
                                    "text-muted-foreground line-through",
                                )}
                              >
                                {task.title}
                              </p>
                              {isSkipped && (
                                <span className="text-[11px] text-muted-foreground">
                                  Skipped
                                </span>
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

                            {isSkipped && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {task.skipReason
                                  ? `Skipped: ${task.skipReason}`
                                  : "Skipped"}
                              </p>
                            )}
                            {task.type === "test" && (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className={cn(isInactive && "line-through")}>
                                  {task.testResult
                                    ? `Result: ${task.testResult}`
                                    : "Result: not added"}
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
                          <div className="flex items-center gap-2 whitespace-nowrap justify-between w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  getDurationColor(task.durationMinutes),
                                  isInactive && "text-muted-foreground",
                                )}
                              >
                                {task.durationMinutes} min
                              </span>
                              {task.startTime && task.endTime && (
                                <span className={cn(
                                  "text-[11px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono",
                                  isInactive 
                                    ? "bg-muted text-muted-foreground/60" 
                                    : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80",
                                )}>
                                  <ClockIcon className="h-2.5 w-2.5" />
                                  {task.startTime} - {task.endTime}
                                </span>
                              )}
                            </div>
                         
                            {!isDone && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                              
                                onClick={() => {
                                  if (isSkipped) {
                                    updateTaskMutation.mutate({
                                      taskId: task.id,
                                      status: "pending",
                                      timeZone: resolvedTimeZone,
                                    });
                                    return;
                                  }
                                  openSkipDialog(task);
                                }}
                                disabled={updateTaskMutation.isPending}
                              >
                                   {isSkipped ? (
                               <span className="text-muted-foreground">Undo skip</span>
                                   ) : (
                                    <>
                                    Skip
                                    <IconArrowRight className="h-3 w-3" />
                                   
                                    </>
                                   )}
                              </Button>
                            )}
                          </div>
                          {isSessionTask && pomodoro.session && (
                            <PomodoroTimer
                              session={pomodoro.session}
                              remainingMs={pomodoro.remainingMs}
                              isMarkingComplete={updateTaskMutation.isPending}
                              reward={
                                lastReward?.taskId === pomodoro.session.taskId
                                  ? lastReward
                                  : null
                              }
                              onPause={pomodoro.pause}
                              onResume={pomodoro.resume}
                              onStop={pomodoro.stop}
                              onStartBreak={pomodoro.startBreak}
                              onToggleSound={pomodoro.toggleSound}
                              onMarkComplete={pomodoro.stop}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
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
      <PomodoroDialog
        key={pomodoroTask?.id ?? "pomodoro"}
        open={pomodoroDialogOpen}
        taskTitle={pomodoroTask?.title}
        taskDurationMinutes={pomodoroTask?.durationMinutes}
        onOpenChange={(open) => {
          setPomodoroDialogOpen(open);
          if (!open) setPomodoroTask(null);
        }}
        onStart={handlePomodoroStart}
      />
      <SkipReasonDialog
        open={skipDialogOpen}
        taskTitle={skipTask?.title}
        isSaving={updateTaskMutation.isPending}
        onOpenChange={handleSkipDialogChange}
        onCancel={closeSkipDialog}
        onSelect={handleSkipReasonSelect}
      />
      <PlanReflectionDialog
        key={planner.id ?? "reflection"}
        open={shouldPromptReflection}
        isSaving={isSavingReflection}
        onOpenChange={handleReflectionDialogChange}
        onCancel={() => {
          if (planner.id) {
            setDismissedReflectionPlanId(planner.id);
          }
        }}
        onSubmit={handleReflectionSubmit}
      />
    </Card>
  );
};
