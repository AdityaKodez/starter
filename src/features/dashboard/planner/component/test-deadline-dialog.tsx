"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { Subject } from "@/generated/prisma/enums";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { format, isBefore, isValid, parseISO, startOfDay } from "date-fns";
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

type TestDeadlineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function TestDeadlineDialog({
  open,
  onOpenChange,
  onSuccess,
}: TestDeadlineDialogProps) {
  const [subject, setSubject] = useState<Subject | "">(Subject.physics);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isMobile = useIsMobile();
  const trpc = useTRPC();

  const mutation = useMutation(
    trpc.planner.addTestDeadline.mutationOptions({
      onSuccess: () => {
        setSubject(Subject.physics);
        setTitle("");
        setScheduledAt(format(new Date(), "yyyy-MM-dd"));
        setNotes("");
        onSuccess();
        onOpenChange(false);
      },
    }),
  );

  const trimmedTitle = title.trim();
  const trimmedNotes = notes.trim();
  const todayValue = format(new Date(), "yyyy-MM-dd");
  const today = startOfDay(new Date());
  const selectedDate = scheduledAt ? parseISO(scheduledAt) : null;
  const scheduledDateLabel =
    selectedDate && isValid(selectedDate)
      ? format(selectedDate, "EEE, MMM d, yyyy")
      : "Pick a date";
  const canSave =
    subject !== "" && trimmedTitle.length > 0 && scheduledAt >= todayValue;

  const handleSave = () => {
    if (!canSave) return;
    mutation.mutate({
      subject: subject as Subject,
      title: trimmedTitle,
      scheduledAt,
      notes: trimmedNotes || undefined,
    });
  };

  const formContent = (
    <div className="space-y-4 pt-4 pb-2">
      <div className="space-y-2">
        <Label htmlFor="deadline-subject-select">Subject</Label>
        <Select
          value={subject}
          onValueChange={(value) => setSubject(value as Subject)}
          disabled={mutation.isPending}
        >
          <SelectTrigger id="deadline-subject-select">
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
        <Label htmlFor="deadline-title-input">Test title</Label>
        <Input
          id="deadline-title-input"
          value={title}
          placeholder="e.g. Coaching mock test"
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          disabled={mutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline-date-trigger">Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="deadline-date-trigger"
              type="button"
              variant="outline"
              className=""
              disabled={mutation.isPending}
            >
              <span className="flex min-w-0 items-center gap-3">
               
                  <IconCalendar className="size-4" />
               
                <span className="truncate">{scheduledDateLabel}</span>
              </span>
              <IconChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date) => {
                if (!date) return;

                setScheduledAt(format(date, "yyyy-MM-dd"));
                setCalendarOpen(false);
              }}
              disabled={(date) => isBefore(date, today) || mutation.isPending}
            />
          </PopoverContent>
        </Popover>
        {selectedDate && isBefore(selectedDate, today) && (
          <p className="text-xs text-destructive">
            Test date cannot be in the past.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline-notes-input">Notes (Optional)</Label>
        <Textarea
          id="deadline-notes-input"
          value={notes}
          placeholder="Scope, chapter focus, or anything to remember"
          maxLength={200}
          onChange={(event) => setNotes(event.target.value)}
          disabled={mutation.isPending}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add upcoming test</DrawerTitle>
            <DrawerDescription>
              Save a test date so future plans can prepare around it.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{formContent}</div>
          <DrawerFooter className="pt-2">
            <Button type="button" onClick={handleSave} disabled={!canSave || mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save test"}
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
          <DialogTitle>Add upcoming test</DialogTitle>
          <DialogDescription>
            Save a test date so future plans can prepare around it.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave || mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
