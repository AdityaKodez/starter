import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { IconBrandYoutubeFilled, IconArrowRight } from "@tabler/icons-react";

export const Hero = () => {
  return (
    <section className="bg-background py-8 md:py-18 w-full px-4">
      <div className="w-full flex flex-col justify-center gap-5">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight font-heading">
          Turn any YouTube playlist ,{" "}
          <IconBrandYoutubeFilled className="size-12 md:size-16 inline-block align-middle text-red-500 rotate-12 hover:roat" />{" "}
          <br />
          into a structured course.
        </h1>
        <p className="text-lg md:text-xl font-medium text-muted-foreground max-w-xl ">
          Paste a playlist URL and Coursa turns every video into structred
          courses .{" "}
          <span className="underline">
            summaries, mind maps, diagrams, and quizzes{" "}
          </span>{" "}
          — instantly.
        </p>
      </div>

      <div className="mt-10 max-w-xl">
        <InputGroup className="h-12 rounded-xl shadow-md">
          <InputGroupAddon align="inline-start" className="pl-3">
            <InputGroupText>
              <IconBrandYoutubeFilled className="size-5 text-red-500" />
            </InputGroupText>
          </InputGroupAddon>

          <InputGroupInput
            type="url"
            placeholder="Paste a YouTube playlist URL…"
            className="text-sm h-full px-3"
          />

          <InputGroupAddon align="inline-end" className="pr-1.5">
            <InputGroupButton
              variant="secondary"
              className="h-10 gap-1.5 rounded-full px-4 text-sm font-semibold"
            >
              <p className="font-bold hidden md:block">Convert</p>
              <IconArrowRight className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  );
};
