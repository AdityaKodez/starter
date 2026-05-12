-- CreateEnum
CREATE TYPE "ReflectionTaskFeel" AS ENUM ('too_easy', 'right_level', 'too_hard');

-- CreateEnum
CREATE TYPE "ReflectionMood" AS ENUM ('low', 'okay', 'good');

-- AlterTable
ALTER TABLE "StudyPlanTask" ADD COLUMN     "skipReason" TEXT;

-- CreateTable
CREATE TABLE "StudyPlanReflection" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "taskFeeling" "ReflectionTaskFeel" NOT NULL,
    "mood" "ReflectionMood" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlanReflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanReflection_planId_key" ON "StudyPlanReflection"("planId");

-- AddForeignKey
ALTER TABLE "StudyPlanReflection" ADD CONSTRAINT "StudyPlanReflection_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
