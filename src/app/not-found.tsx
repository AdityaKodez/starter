import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <p className="text-7xl font-bold tracking-tighter text-foreground/10 sm:text-9xl">
          404
        </p>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard">
            <IconArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
