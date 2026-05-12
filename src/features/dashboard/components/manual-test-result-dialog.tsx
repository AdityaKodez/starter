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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject } from "@/generated/prisma/enums";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type ManualTestResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ManualTestResultDialog({
  open,
  onOpenChange,
  onSuccess,
}: ManualTestResultDialogProps) {
  const [subject, setSubject] = useState<Subject | "">(Subject.physics);
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("");

  const isMobile = useIsMobile();
  const trpc = useTRPC();

  const mutation = useMutation(
    trpc.planner.addManualTestResult.mutationOptions({
      onSuccess: () => {
        setSubject(Subject.physics);
        setResult("");
        setTitle("");
        onSuccess();
        onOpenChange(false);
      },
    })
  );

  const trimmedResult = result.trim();
  const trimmedTitle = title.trim();
  const canSave = subject !== "" && trimmedResult.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    mutation.mutate({
      subject: subject as Subject,
      result: trimmedResult,
      title: trimmedTitle || undefined,
    });
  };

  const formContent = (
    <div className="space-y-4 pt-4 pb-2">
      <div className="space-y-2">
        <Label htmlFor="subject-select">Subject</Label>
        <Select
          value={subject}
          onValueChange={(val) => setSubject(val as Subject)}
          disabled={mutation.isPending}
        >
          <SelectTrigger id="subject-select">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Subject).map((subj) => (
              <SelectItem key={subj} value={subj}>
                {subj.charAt(0).toUpperCase() + subj.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title-input">Title (Optional)</Label>
        <Input
          id="title-input"
          value={title}
          placeholder="e.g. Mock Test 1"
          onChange={(event) => setTitle(event.target.value)}
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-result-input">Test Result</Label>
        <Input
          id="test-result-input"
          value={result}
          placeholder="Example: 16/20 or 80%"
          onChange={(event) => setResult(event.target.value)}
          disabled={mutation.isPending}
        />
        <p className="text-xs text-muted-foreground">
          Keep it short so it&apos;s easy to scan later. Use formats like 16/20 or 80%.
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add test result</DrawerTitle>
            <DrawerDescription>
              Record a test score to track your performance.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{formContent}</div>
          <DrawerFooter className="pt-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save result"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add test result</DialogTitle>
          <DialogDescription>
            Record a test score to track your performance.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
