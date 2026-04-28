"use client";

import { MISTAKE_DEFAULT_PAGE_SIZE } from "@/configs/const/mistake";
import { EmptyState } from "@/components/empty-state";
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
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { IconFileX } from "@tabler/icons-react";
import { format } from "date-fns";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type MistakeViewOutput = RouterOutput["mistake"]["view"];
type MistakeViewItem = MistakeViewOutput["items"][number];

const viewInput = {
  limit: MISTAKE_DEFAULT_PAGE_SIZE,
};

export function MistakeViewer() {
  const trpc = useTRPC();

  const viewQuery = useSuspenseInfiniteQuery(
    trpc.mistake.view.infiniteQueryOptions(viewInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }) as never,
  );

  const mistakes = (((viewQuery.data as { pages?: MistakeViewOutput[] } | undefined)
    ?.pages ?? []) as {
    items: MistakeViewItem[];
  }[]).flatMap((page) => page.items);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent mistakes</CardTitle>
        <CardDescription>
          Review analysed mistakes from your uploaded answer sheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mistakes.length === 0 && (
          <EmptyState
            title="No mistakes found"
            description="Upload your answer sheets and run an analysis to see mistakes here."
            icon={IconFileX}
          />
        )}

        {mistakes.length > 0 && (
          <div className="space-y-3">
            {mistakes.map((mistake) => {
              const displayTitle = mistake.description?.slice(0, 80) || "Untitled mistake";

              return (
                <div
                  key={mistake.id}
                  className="flex items-start justify-between gap-3 rounded-xl border bg-background/50 p-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{displayTitle}</p>
                      <Badge variant="secondary">{mistake.type}</Badge>
                      <Badge variant="outline">{mistake.status}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {mistake.topic}
                      {mistake.confidence !== null
                        ? ` • Confidence: ${Math.round(mistake.confidence * 100)}%`
                        : ""}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Detected {format(new Date(mistake.createdAt), "dd MMM yyyy")}
                      {mistake.analysisRun?.modelVersion
                        ? ` • Model: ${mistake.analysisRun.modelVersion}`
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
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
