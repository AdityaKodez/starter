import { Button } from "@/components/ui/button";
import {
  IconFileUpload,
  IconTargetArrow
} from "@tabler/icons-react";

export const Hero = () => {
  return (
    <section className="bg-background py-18 md:py-24 w-full px-4 rounded-b-2xl">
      <div className="w-full flex flex-col justify-center gap-6">
        <h1 className="sm:text-4xl text-3xl max-w-4xl md:text-6xl font-medium tracking-tight font-heading leading-tight">
          Turn every wrong answer into your next score jump.
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-xl">
          Upload a JEE test review. ReviseRight finds your mistake patterns,
          weak topics, and the exact practice you should do next.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:max-w-md">
        <Button size="lg" className="h-12 rounded-xl px-5">
          <span className="flex items-center gap-2">
            <IconFileUpload data-icon="inline-start" />
            Upload Test Review
          </span>
          
        </Button>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconTargetArrow className="mt-0.5 size-4 shrink-0 text-primary" />
          OCR review, mistake categories, and revision priorities are coming in
          the MVP flow.
        </p>
      </div>
    </section>
  );
};
