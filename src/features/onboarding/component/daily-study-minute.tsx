import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export const DailyStudyMinuteUI = ({
  onSubmit,
}: {
  onSubmit: (minutes: number) => void;
}) => {
  const [value, setValue] = useState([180]); // default 3 hours

  const hours = Math.floor(value[0] / 60);
  const minutes = value[0] % 60;
  const displayTime = `${hours > 0 ? `${hours} hr ` : ""}${
    minutes > 0 ? `${minutes} min` : ""
  }`;

  return (
    <div className="flex flex-col gap-6 w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Study Time</span>
        <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
          {displayTime.trim()}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={840} // 14 hours
        min={60} // 1 hour
        step={30}
        className="w-full cursor-grab"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 hr</span>
        <span>14 hrs</span>
      </div>
      <Button onClick={() => onSubmit(value[0])} className="w-full mt-2">
        Confirm Goal
      </Button>
    </div>
  );
};
