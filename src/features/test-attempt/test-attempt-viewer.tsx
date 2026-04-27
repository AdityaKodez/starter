"use client";

import { TEST_ATTEMPT_DEFAULT_PAGE_SIZE } from "@/configs/const/test-attempt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import { useMutation, useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { IconTrash, IconFileX } from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type TestAttemptViewOutput = RouterOutput["testAttempt"]["view"];
type TestAttemptViewItem = TestAttemptViewOutput["items"][number];

const viewInput = {
  limit: TEST_ATTEMPT_DEFAULT_PAGE_SIZE,
};

export function TestAttemptViewer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const viewQuery = useSuspenseInfiniteQuery(
    trpc.testAttempt.view.infiniteQueryOptions(viewInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }) as never,
  );

  const deleteMutation = useMutation(
    trpc.testAttempt.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Test attempt deleted");
        await queryClient.invalidateQueries({
          queryKey: trpc.testAttempt.view.queryKey(viewInput),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete test attempt");
      },
    }),
  );

  const attempts = (((viewQuery.data as { pages?: TestAttemptViewOutput[] } | undefined)?.pages ?? []) as {
    items: TestAttemptViewItem[];
  }[]).flatMap((page) => page.items);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent test attempts</CardTitle>
        <CardDescription>
          Review your recent attempts with cursor pagination.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {attempts.length === 0 && (
       <EmptyState
            title="No test attempts found"
            description="It looks like you haven't attempted any tests yet. Start practicing to see your attempts here!"
            icon={IconFileX}
            action={{
                label: "Explore tests",
                onClick:()=> toast("Redirect to tests page - to be implemented"),
                variant:"default"
            }}
          />
        )}

        {attempts.length > 0 && (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-start justify-between gap-3 rounded-xl border bg-background/50 p-3"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{attempt.title}</p>
                    <Badge variant="secondary">{attempt.type}</Badge>
                    <Badge variant="outline">{attempt.status}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Attempted on {format(new Date(attempt.attemptedAt), "dd MMM yyyy")}
                    {attempt.examName ? ` • ${attempt.examName}` : ""}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Questions: {attempt.totalQuestions ?? "-"} • Logged: {attempt._count.questions}
                    {attempt.score !== null && attempt.maxScore !== null
                      ? ` • Score: ${attempt.score}/${attempt.maxScore}`
                      : ""}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => deleteMutation.mutate({ id: attempt.id })}
                  disabled={deleteMutation.isPending}
                  aria-label={`Delete ${attempt.title}`}
                >
                  <IconTrash />
                </Button>
              </div>
            ))}
          </div>
        )}

        {viewQuery.hasNextPage && (
          <Button
            variant="outline"
            onClick={() => viewQuery.fetchNextPage()}
            disabled={viewQuery.isFetchingNextPage}
          >
            {viewQuery.isFetchingNextPage ? "Loading more..." : "Load more"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
