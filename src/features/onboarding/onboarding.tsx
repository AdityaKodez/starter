"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useMemo, useState } from "react";
import { AssistantLogo } from "./component/assistant-logo";
import { AttemptTypeStep } from "./component/attempt-type-step";
import { CoachingTimingStep } from "./component/coaching-timing-step";
import { DailyStudyMinuteUI } from "./component/daily-study-minute";
import { ExamYearStep } from "./component/exam-year-step";
import { WeakestSubjectStep } from "./component/weakest-subject-step";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { toast } from "sonner";
import { Subject } from "@/generated/prisma/enums";
// --- Types ---

interface OnboardingData {
  examYear: number | null;
  attemptNumber: number | null;
  dailyStudyMinutes: number | null;
  coachingStart: number | null;
  coachingEnd: number | null;
  weakestSubject: Subject | null;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  component?: React.ReactNode;
}

// --- Step definitions ---

type StepKey =
  | "examYear"
  | "attemptType"
  | "dailyStudy"
  | "coachingTiming"
  | "onboarding-complete"
  | "weakest-subject";

interface StepDef {
  key: StepKey;
  question: string;
  formatAnswer: (data: OnboardingData) => string;
}

const STEPS: StepDef[] = [
  {
    key: "examYear",
    question:
      "Hey! I'm Aura, your exam preparation buddy. 🎯\n\nLet's get you set up. First — **which year are you preparing for?**",
    formatAnswer: (data) => `I'm preparing for ${data.examYear}`,
  },
  {
    key: "attemptType",
    question:
      "Got it! Are you **taking your first shot** or have you attempted before?",
    formatAnswer: (data) =>
      data.attemptNumber === 1
        ? "First attempt — let's nail it!"
        : "I'm giving it another shot",
  },
  {
    key: "dailyStudy",
    question:
      "Great. **How many hours can you dedicate to studying daily?** \n\nDrag the slider to set your daily study goal.",
    formatAnswer: (data) => {
      const mins = data.dailyStudyMinutes ?? 0;
      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;
      return `I can study ${hours > 0 ? `${hours} hr ` : ""}${remaining > 0 ? `${remaining} min` : ""}daily`.trim();
    },
  },
  {
    key: "coachingTiming",
    question:
      "Almost there! **What are your tuition/coaching timings?** \n\nThis helps me plan your self-study schedule around your coaching hours.",
    formatAnswer: (data) => {
      const formatTime = (h: number) => {
        const period = h >= 12 ? "PM" : "AM";
        const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${display}:00 ${period}`;
      };
      return `My coaching is from ${formatTime(data.coachingStart ?? 9)} to ${formatTime(data.coachingEnd ?? 17)}`;
    },
  },
  {
    key: "weakest-subject",
    question: `Got it Whats your weakest subject right now ? that would help me build your study plan accordingly`,
    formatAnswer: (data) => {
      return `My weakest subject is ${data.weakestSubject}`;
    },
  },
];

const COMPLETION_MESSAGE =
  "You're all set! 🎉 Let me save your preferences and take you to your dashboard...";

// --- Component ---

const OnboardingChat = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    examYear: null,
    attemptNumber: null,
    dailyStudyMinutes: null,
    coachingStart: null,
    coachingEnd: null,
    weakestSubject: null,
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const trpc = useTRPC();
  const completeMutation = useMutation(
    trpc.onboarding.complete.mutationOptions({
      onSuccess: () => {
        toast.success("Onboarding completed successfully");
      },
    }),
  );

  const isComplete = currentStep >= STEPS.length;

  // Advance to next step and trigger mutation if done
  const advanceStep = useCallback(
    (updatedData: OnboardingData) => {
      const nextStep = currentStep + 1;
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(nextStep);

      // If all steps are done, submit to backend
      if (nextStep >= STEPS.length) {
        completeMutation.mutate({
          examYear: updatedData.examYear!,
          attemptNumber: updatedData.attemptNumber,
          dailyStudyMinutes: updatedData.dailyStudyMinutes,
          coachingStart: updatedData.coachingStart,
          coachingEnd: updatedData.coachingEnd,
          weakestSubject: updatedData.weakestSubject,
        });
      }
    },
    [currentStep, completeMutation],
  );

  // Step handlers
  const handleExamYear = useCallback(
    (year: number) => {
      const updated = { ...onboardingData, examYear: year };
      setOnboardingData(updated);
      advanceStep(updated);
    },
    [onboardingData, advanceStep],
  );

  const handleAttemptType = useCallback(
    (attempt: number) => {
      const updated = { ...onboardingData, attemptNumber: attempt };
      setOnboardingData(updated);
      advanceStep(updated);
    },
    [onboardingData, advanceStep],
  );

  const handleDailyStudy = useCallback(
    (minutes: number) => {
      const updated = { ...onboardingData, dailyStudyMinutes: minutes };
      setOnboardingData(updated);
      advanceStep(updated);
    },
    [onboardingData, advanceStep],
  );

  const handleWeakestSubject = useCallback(
    (subject: Subject) => {
      const updated = { ...onboardingData, weakestSubject: subject };
      setOnboardingData(updated as OnboardingData);
      advanceStep(updated as OnboardingData);
    },
    [onboardingData, advanceStep],
  );
  const handleCoachingTiming = useCallback(
    (start: number, end: number) => {
      const updated = {
        ...onboardingData,
        coachingStart: start,
        coachingEnd: end,
      };
      setOnboardingData(updated);
      advanceStep(updated);
    },
    [onboardingData, advanceStep],
  );

  // Build message list from completed steps + current step
  const messages = useMemo(() => {
    const msgs: ChatMessage[] = [];
    let msgId = 0;

    for (const stepIndex of completedSteps) {
      const step = STEPS[stepIndex];
      // Assistant question
      msgs.push({
        id: `msg-${msgId++}`,
        role: "assistant",
        text: step.question,
      });
      // User answer
      msgs.push({
        id: `msg-${msgId++}`,
        role: "user",
        text: step.formatAnswer(onboardingData),
      });
    }

    // Current step (if not complete)
    if (!isComplete) {
      const step = STEPS[currentStep];
      msgs.push({
        id: `msg-${msgId++}`,
        role: "assistant",
        text: step.question,
        component: renderStepComponent(
          step.key,
          handleExamYear,
          handleAttemptType,
          handleDailyStudy,
          handleCoachingTiming,
          handleWeakestSubject,
        ),
      });
    } else {
      // Completion message
      msgs.push({
        id: `msg-${msgId++}`,
        role: "assistant",
        text: COMPLETION_MESSAGE,
      });
    }

    return msgs;
  }, [
    completedSteps,
    currentStep,
    isComplete,
    onboardingData,
    handleExamYear,
    handleAttemptType,
    handleDailyStudy,
    handleCoachingTiming,
    handleWeakestSubject,
  ]);

  return (
    <div className="max-w-4xl mx-auto pt-8 md:pt-18 relative size-full no-scrollbar">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Fragment key={message.id}>
                <Message from={message.role}>
                  {message.role === "assistant" && <AssistantLogo />}
                  <MessageContent>
                    <MessageResponse>{message.text}</MessageResponse>
                    {message.component}
                  </MessageContent>
                </Message>
              </Fragment>
            ))}
            {/* Submission loading state */}
            {isComplete && completeMutation.isPending && (
              <Message from="assistant">
                <AssistantLogo />
                <MessageContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <Loader2Icon className="size-4 animate-spin" />
                    <Shimmer duration={3} spread={3}>
                      Saving your Preferences....
                    </Shimmer>
                  </div>
                </MessageContent>
              </Message>
            )}
            {/* Success state */}
            {isComplete && completeMutation.isSuccess && (
              <Message from="assistant">
                <AssistantLogo />
                <MessageContent>
                  <MessageResponse>
                    You&apos;re all set! 🎉 Your study plan is ready. Let&apos;s
                    get started.
                  </MessageResponse>
                  <Button
                    className="mt-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
                    onClick={() => router.push("/")}
                  >
                    Go to Dashboard →
                  </Button>
                </MessageContent>
              </Message>
            )}
            {/* Error state */}
            {completeMutation.isError && (
              <Message from="assistant">
                <AssistantLogo />
                <MessageContent>
                  <MessageResponse className="text-red-500">
                    {completeMutation.error?.message ??
                      "Something went wrong. Please try again."}
                  </MessageResponse>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
    </div>
  );
};

// Render the correct step component based on step key
function renderStepComponent(
  key: StepKey,
  onExamYear: (year: number) => void,
  onAttemptType: (attempt: number) => void,
  onDailyStudy: (minutes: number) => void,
  onCoachingTiming: (start: number, end: number) => void,
  onWeakestSubject: (subject: Subject) => void,
): React.ReactNode {
  switch (key) {
    case "examYear":
      return <ExamYearStep onSubmit={onExamYear} />;
    case "attemptType":
      return <AttemptTypeStep onSubmit={onAttemptType} />;
    case "dailyStudy":
      return <DailyStudyMinuteUI onSubmit={onDailyStudy} />;
    case "coachingTiming":
      return <CoachingTimingStep onSubmit={onCoachingTiming} />;
    case "weakest-subject":
      return <WeakestSubjectStep onSubmit={onWeakestSubject} />;
  }
}

export default OnboardingChat;
