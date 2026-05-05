"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

export const ExamYearStep = ({
  onSubmit,
}: {
  onSubmit: (year: number) => void;
}) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="flex flex-col gap-4 w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select exam year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => onSubmit(Number(selected))}
        disabled={!selected}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};
