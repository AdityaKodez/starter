/*
  Warnings:

  - Made the column `attemptNumber` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dailyStudyMinutes` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coachingStart` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rankAim` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coachingEnd` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weakestSubject` on table `Onboarding` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Onboarding" ALTER COLUMN "attemptNumber" SET NOT NULL,
ALTER COLUMN "dailyStudyMinutes" SET NOT NULL,
ALTER COLUMN "coachingStart" SET NOT NULL,
ALTER COLUMN "rankAim" SET NOT NULL,
ALTER COLUMN "coachingEnd" SET NOT NULL,
ALTER COLUMN "weakestSubject" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudyPlanTask" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "timeZone" TEXT;

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");

-- CreateIndex
CREATE INDEX "Streak_userId_idx" ON "Streak"("userId");

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
