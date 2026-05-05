/*
  Warnings:

  - You are about to drop the `AnalysisRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mistake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UploadBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question_attempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_attempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('physics', 'chemistry', 'maths', 'english', 'cs');

-- DropForeignKey
ALTER TABLE "AnalysisRun" DROP CONSTRAINT "AnalysisRun_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentChunk" DROP CONSTRAINT "DocumentChunk_analysisRunId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentChunk" DROP CONSTRAINT "DocumentChunk_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "Mistake" DROP CONSTRAINT "Mistake_analysisRunId_fkey";

-- DropForeignKey
ALTER TABLE "UploadBatch" DROP CONSTRAINT "UploadBatch_testAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "UploadBatch" DROP CONSTRAINT "UploadBatch_userId_fkey";

-- DropForeignKey
ALTER TABLE "question_attempt" DROP CONSTRAINT "question_attempt_testAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "question_attempt" DROP CONSTRAINT "question_attempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "test_attempt" DROP CONSTRAINT "test_attempt_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingDone" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AnalysisRun";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "DocumentChunk";

-- DropTable
DROP TABLE "Mistake";

-- DropTable
DROP TABLE "UploadBatch";

-- DropTable
DROP TABLE "question_attempt";

-- DropTable
DROP TABLE "test_attempt";

-- DropEnum
DROP TYPE "AnalysisStatus";

-- DropEnum
DROP TYPE "AttachmentType";

-- DropEnum
DROP TYPE "AttachmentUploadStatus";

-- DropEnum
DROP TYPE "MistakeStatus";

-- DropEnum
DROP TYPE "MistakeType";

-- DropEnum
DROP TYPE "OcrStatus";

-- DropEnum
DROP TYPE "QuestionResult";

-- DropEnum
DROP TYPE "TestAttemptStatus";

-- DropEnum
DROP TYPE "TestAttemptType";

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "examYear" INTEGER NOT NULL,
    "attemptNumber" INTEGER,
    "dailyStudyMinutes" INTEGER,
    "coachingStart" INTEGER,
    "rankAim" INTEGER,
    "coachingEnd" INTEGER,
    "weakestSubject" "Subject",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
