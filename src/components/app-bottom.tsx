import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

type AppBottomProps = {
    previousHref?: string;
    nextHref?: string;
};

export const AppBottom = ({
    previousHref,
    nextHref,
   
}: AppBottomProps) => {
    return (
        <div className="sticky  px-4 bottom-0 z-20 mt-4 bg-background/90 py-3 backdrop-blur supports-backdrop-filter:bg-background/70">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
                {previousHref ? (
                    <Button asChild variant="outline">
                        <Link href={previousHref}>
                            <IconArrowLeft />
                            Previous
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" disabled>
                        <IconArrowLeft />
                        Previous
                    </Button>
                )}

                {nextHref ? (
                    <Button asChild>
                        <Link href={nextHref}>
                            Next
                            <IconArrowRight />
                        </Link>
                    </Button>
                ) : (
                    <Button disabled>
                        Next
                        <IconArrowRight />
                    </Button>
                )}
            </div>
        </div>
    );
};