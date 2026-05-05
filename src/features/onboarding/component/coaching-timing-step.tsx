"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const formatTime = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

export const CoachingTimingStep = ({
  onSubmit,
}: {
  onSubmit: (start: number, end: number) => void;
}) => {
  const [range, setRange] = useState<number[]>([9, 17]); // 9 AM to 5 PM default

  const duration = range[1] - range[0];

  return (
    <div className="flex flex-col gap-6 w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Tuition Hours</span>
        <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
          {formatTime(range[0])} – {formatTime(range[1])}
        </span>
      </div>
      <Slider
        value={range}
        onValueChange={setRange}
        max={22}
        min={5}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5:00 AM</span>
        <span className="text-foreground font-medium">{duration} hrs</span>
        <span>10:00 PM</span>
      </div>
      <Button onClick={() => onSubmit(range[0], range[1])} className="w-full">
        Continue
      </Button>
    </div>
  );
};
