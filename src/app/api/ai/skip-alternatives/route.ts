import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSkipAlternatives } from "@/utils/planner-utils/generate-skip-alternatives";

const requestSchema = z.object({
  taskId: z.string().min(1),
  skipReason: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: "Invalid skip alternative request" },
      { status: 400 },
    );
  }

  const task = await prisma.studyPlanTask.findFirst({
    where: {
      id: parsed.data.taskId,
      plan: { userId: session.user.id },
    },
    select: {
      title: true,
      type: true,
      subject: true,
      durationMinutes: true,
      reason: true,
      topic: {
        select: {
          name: true,
          difficulty: true,
          estimatedMinutes: true,
          chapter: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return Response.json({ message: "Task not found" }, { status: 404 });
  }

  const moodData = await prisma.studyPlanReflection.findMany({
    where: {
      plan: { userId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      mood: true,
      taskFeeling: true,
      createdAt: true,
    },
  });

  try {
    const result = await generateSkipAlternatives({
      skipReason: parsed.data.skipReason,
      task: {
        title: task.title,
        type: task.type,
        subject: task.subject,
        durationMinutes: task.durationMinutes,
        reason: task.reason,
        topicName: task.topic?.name ?? null,
        chapterName: task.topic?.chapter.name ?? null,
        topicDifficulty: task.topic?.difficulty ?? null,
        topicEstimatedMinutes: task.topic?.estimatedMinutes ?? null,
      },
      moodData: moodData.map((entry) => ({
        mood: entry.mood,
        taskFeeling: entry.taskFeeling,
        createdAt: entry.createdAt.toISOString(),
      })),
    });

    return Response.json(result);
  } catch (error) {
    console.error("Failed to generate skip alternatives", error);
    return Response.json(
      { message: "Failed to generate skip alternatives" },
      { status: 502 },
    );
  }
}
