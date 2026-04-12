import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import { PlaylistUrlInput } from "./playlist-url-input";

export const Hero = () => {
  return (
    <section className="bg-background py-12 md:py-24 w-full px-4">
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
      <PlaylistUrlInput />
      </div>
    </section>
  );
};
