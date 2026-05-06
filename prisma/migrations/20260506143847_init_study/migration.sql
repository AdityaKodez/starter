/*
  Warnings:

  - The values [english,cs] on the enum `Subject` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'completed', 'reset');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'done', 'skipped', 'partial');

-- CreateEnum
CREATE TYPE "TopicDifficulty" AS ENUM ('easy', 'medium', 'hard', 'advanced');

-- CreateEnum
CREATE TYPE "TopicImportance" AS ENUM ('primary', 'secondary', 'optional');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- AlterEnum
BEGIN;
CREATE TYPE "Subject_new" AS ENUM ('physics', 'chemistry', 'maths');
ALTER TABLE "Onboarding" ALTER COLUMN "weakestSubject" TYPE "Subject_new" USING ("weakestSubject"::text::"Subject_new");
ALTER TYPE "Subject" RENAME TO "Subject_old";
ALTER TYPE "Subject_new" RENAME TO "Subject";
DROP TYPE "public"."Subject_old";
COMMIT;

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalMinutes" INTEGER NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "title" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudyPlanTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyChapter" (
    "id" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudyChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTopic" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" "TopicDifficulty" NOT NULL,
    "importance" "TopicImportance" NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudyTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "TopicStatus" NOT NULL DEFAULT 'not_started',
    "confidence" INTEGER,
    "lastStudiedAt" TIMESTAMP(3),
    "lastRevisedAt" TIMESTAMP(3),
    "mistakesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_userId_date_key" ON "StudyPlan"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudyChapter_subject_name_key" ON "StudyChapter"("subject", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StudyTopic_chapterId_name_key" ON "StudyTopic"("chapterId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicProgress_userId_topicId_key" ON "UserTopicProgress"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTask" ADD CONSTRAINT "StudyPlanTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTopic" ADD CONSTRAINT "StudyTopic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "StudyChapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicProgress" ADD CONSTRAINT "UserTopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicProgress" ADD CONSTRAINT "UserTopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
