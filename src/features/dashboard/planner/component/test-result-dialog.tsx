"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type TestResultDialogTask = {
  id: string;
  title: string;
  testResult: string | null;
};

type TestResultDialogProps = {
  open: boolean;
  task: TestResultDialogTask | null;
  intent: "complete" | "edit";
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSave: (result: string | null) => void;
};

export function TestResultDialog({
  open,
  task,
  intent,
  isSaving,
  onOpenChange,
  onCancel,
  onSave,
}: TestResultDialogProps) {
 const [value, setValue] = useState(task?.testResult ?? "");

  const trimmedValue = value.trim();
  const canSave = intent === "edit" || trimmedValue.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save test result</DialogTitle>
          <DialogDescription>
            Add the score so we can adapt tomorrow&apos;s plan based on how it went.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {task?.title}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="test-result-input">
              Test result
            </label>
            <Input
              id="test-result-input"
              value={value}
              placeholder="Example: 16/20 or 80%"
              onChange={(event) => setValue(event.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Keep it short so it&apos;s easy to scan later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onSave(trimmedValue.length > 0 ? trimmedValue : null)}
            disabled={!canSave || isSaving}
          >
            {intent === "complete" ? "Save & complete" : "Save result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
