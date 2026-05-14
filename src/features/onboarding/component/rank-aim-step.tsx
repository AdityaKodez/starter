"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const formatRank = (value: number) => {
  if (value >= 10000) return "10,000+";
  return value.toLocaleString("en-US");
};

export const RankAimStep = ({
  onSubmit,
}: {
  onSubmit: (rank: number) => void;
}) => {
  const [value, setValue] = useState([2000]);

  return (
    <div className="flex flex-col gap-6 w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Target Rank</span>
        <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
          {formatRank(value[0])}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={10000}
        min={50}
        step={50}
        className="w-full cursor-grab"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>50</span>
        <span>10,000+</span>
      </div>
      <Button onClick={() => onSubmit(value[0])} className="w-full mt-2">
        Confirm Rank Aim
      </Button>
    </div>
  );
};
