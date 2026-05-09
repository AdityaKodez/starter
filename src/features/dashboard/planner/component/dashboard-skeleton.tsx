import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContentSkeleton() {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-4">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-start justify-center p-4 no-scrollbar max-w-4xl w-full mx-auto py-4 gap-8 sm:py-8">
      <div className="w-full space-y-3">
        <Skeleton className="h-7 w-56 sm:h-8 sm:w-72" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <DashboardContentSkeleton />
    </div>
  );
}
