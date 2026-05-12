"use client";

import { useState } from "react";
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
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subject } from "@/generated/prisma/enums";

export type AddTestResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (values: { subject: Subject; title: string; result: string }) => void;
};

export function AddTestResultDialog({
  open,
  onOpenChange,
  isSaving,
  onSave,
}: AddTestResultDialogProps) {
  const isMobile = useIsMobile();
  const [subject, setSubject] = useState<Subject | "">("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");

  const canSave = subject !== "" && result.trim().length > 0;

  const handleSave = () => {
    if (canSave) {
      onSave({
        subject: subject as Subject,
        title: title.trim(),
        result: result.trim(),
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSubject("");
      setTitle("");
      setResult("");
    }
    onOpenChange(newOpen);
  };

  const formContent = (
    <div className="space-y-4 px-4 sm:px-0">
      <div className="space-y-2">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="subject"
        >
          Subject *
        </label>
        <Select
          value={subject}
          onValueChange={(val) => setSubject(val as Subject)}
          disabled={isSaving}
        >
          <SelectTrigger id="subject" className="w-full">
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
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="title"
        >
          Title (Optional)
        </label>
        <Input
          id="title"
          value={title}
          placeholder="e.g. Mock Test 1"
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="result"
        >
          Test result *
        </label>
        <Input
          id="result"
          value={result}
          placeholder="Example: 16/20 or 80%"
          onChange={(event) => setResult(event.target.value)}
          disabled={isSaving}
        />
        <p className="text-xs text-muted-foreground">
          Use a fraction or percentage so we can calculate averages.
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add test result</DrawerTitle>
            <DrawerDescription>
              Record your scores to track performance over time.
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
          <DrawerFooter>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving}
            >
              {isSaving ? "Saving..." : "Save result"}
            </Button>
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add test result</DialogTitle>
          <DialogDescription>
            Record your scores to track performance over time.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? "Saving..." : "Save result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
