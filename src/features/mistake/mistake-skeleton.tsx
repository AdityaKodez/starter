import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MistakeViewerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-80" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 rounded-xl border bg-background/50 p-3"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Badge variant="secondary" className="animate-pulse">
                  <Skeleton className="h-3 w-16" />
                </Badge>
                <Badge variant="outline" className="animate-pulse">
                  <Skeleton className="h-3 w-16" />
                </Badge>
              </div>
              <Skeleton className="h-3 w-52" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
