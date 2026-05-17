"use client";
import { EmptyState } from "@/components/entity-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Planner } from "./planner/planner";
import { StudyStatsCard } from "./study-stats-card";
import { TestDeadlinesCard, TestResultsCard } from "./test-results-card";

const CardSkeleton = ({ title }: { title: string }) => {
    return (
        <Card className="w-full">
            <CardHeader className="space-y-2">
                <CardTitle className="text-sm text-muted-foreground">
                    {title}
                </CardTitle>
                <Skeleton className="h-4 w-3/5" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
    );
}


const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unknown error";
};

const CardErrorState = ({ title, error }: { title: string; error: unknown }) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <EmptyState
                    icon={AlertTriangleIcon}
                    title="Something went wrong"
                    description="Try again in a moment."
                />
                {process.env.NODE_ENV !== "production" && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        {getErrorMessage(error)}
                    </p>
                )}
            </CardContent>
        </Card>
    )
};

const renderCardError = (title: string) => {
    const CardErrorFallback = ({ error }: FallbackProps) => (
        <CardErrorState title={title} error={error } />
    );

    CardErrorFallback.displayName = `CardErrorFallback(${title})`;

    return CardErrorFallback;
};

export const DashboardContent = () => {
    return (
        <div className="w-full flex flex-col items-start justify-start gap-4">
                    <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
                        <div className="flex flex-col gap-4">

                        <ErrorBoundary FallbackComponent={renderCardError("Planner")}> 
                            <Suspense fallback={<CardSkeleton title="Planner" />}>
                                <Planner />
                            </Suspense>
                        </ErrorBoundary>
                        <ErrorBoundary FallbackComponent={renderCardError("Upcoming tests")}> 
                                <Suspense fallback={<CardSkeleton title="Upcoming tests" />}>
                                    <TestDeadlinesCard />
                                </Suspense>
                            </ErrorBoundary>
                        </div>

                        <div className="flex flex-col gap-4">
                            <ErrorBoundary FallbackComponent={renderCardError("Study streak")}> 
                                <Suspense fallback={<CardSkeleton title="Study streak" />}>
                                    <StudyStatsCard />
                                </Suspense>
                            </ErrorBoundary>
                            
                            <ErrorBoundary FallbackComponent={renderCardError("Test results")}> 
                                <Suspense fallback={<CardSkeleton title="Test results" />}>
                                    <TestResultsCard />
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
         
        </div>
    )
}
