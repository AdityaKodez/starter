/*
  Warnings:

  - You are about to drop the `artifact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlist_lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlist_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlist_video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transcript_chunks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TestAttemptType" AS ENUM ('MOCK_TEST', 'PAST_PAPER', 'SECTIONAL_TEST', 'CHAPTER_TEST', 'PRACTICE_SET', 'LOOSE_PRACTICE');

-- CreateEnum
CREATE TYPE "TestAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionResult" AS ENUM ('UNREVIEWED', 'CORRECT', 'INCORRECT', 'PARTIAL', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MistakeType" AS ENUM ('CONCEPTUAL', 'SILLY', 'CALCULATION', 'MISREAD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MistakeStatus" AS ENUM ('NEW', 'REVIEWING', 'MASTERED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'PDF');

-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "artifact" DROP CONSTRAINT "artifact_playlistVideoId_fkey";

-- DropForeignKey
ALTER TABLE "playlist" DROP CONSTRAINT "playlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "playlist_lesson" DROP CONSTRAINT "playlist_lesson_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "playlist_notes" DROP CONSTRAINT "playlist_notes_playlistvideoId_fkey";

-- DropForeignKey
ALTER TABLE "playlist_video" DROP CONSTRAINT "playlist_video_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "playlist_video" DROP CONSTRAINT "playlist_video_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "transcript_chunks" DROP CONSTRAINT "transcript_chunks_playlistVideoId_fkey";

-- DropTable
DROP TABLE "artifact";

-- DropTable
DROP TABLE "playlist";

-- DropTable
DROP TABLE "playlist_lesson";

-- DropTable
DROP TABLE "playlist_notes";

-- DropTable
DROP TABLE "playlist_video";

-- DropTable
DROP TABLE "transcript_chunks";

-- DropEnum
DROP TYPE "ArtifactType";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "test_attempt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examName" TEXT,
    "sourceName" TEXT,
    "sourceYear" INTEGER,
    "type" "TestAttemptType" NOT NULL DEFAULT 'MOCK_TEST',
    "status" "TestAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,
    "totalQuestions" INTEGER,
    "correctCount" INTEGER,
    "incorrectCount" INTEGER,
    "skippedCount" INTEGER,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attempt" (
    "id" TEXT NOT NULL,
    "questionNumber" INTEGER,
    "questionText" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT,
    "userAnswer" TEXT,
    "result" "QuestionResult" NOT NULL DEFAULT 'UNREVIEWED',
    "subject" TEXT,
    "topic" TEXT,
    "subtopic" TEXT,
    "difficulty" TEXT,
    "marksAwarded" DOUBLE PRECISION,
    "maxMarks" DOUBLE PRECISION,
    "testAttemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "type" "MistakeType" NOT NULL DEFAULT 'UNKNOWN',
    "status" "MistakeStatus" NOT NULL DEFAULT 'NEW',
    "contextFlags" JSONB,
    "userNote" TEXT,
    "rootCause" TEXT,
    "fixPlan" TEXT,
    "retryDueAt" TIMESTAMP(3),
    "lastRetriedAt" TIMESTAMP(3),
    "masteredAt" TIMESTAMP(3),
    "questionAttemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake_attachment" (
    "id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "publicUrl" TEXT,
    "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ocrText" TEXT,
    "ocrJson" JSONB,
    "ocrError" TEXT,
    "mistakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mistake_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake_retry" (
    "id" TEXT NOT NULL,
    "answer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "note" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mistakeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mistake_retry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_attempt_userId_attemptedAt_idx" ON "test_attempt"("userId", "attemptedAt");

-- CreateIndex
CREATE INDEX "test_attempt_userId_type_idx" ON "test_attempt"("userId", "type");

-- CreateIndex
CREATE INDEX "question_attempt_testAttemptId_idx" ON "question_attempt"("testAttemptId");

-- CreateIndex
CREATE INDEX "question_attempt_userId_result_idx" ON "question_attempt"("userId", "result");

-- CreateIndex
CREATE INDEX "question_attempt_userId_subject_topic_idx" ON "question_attempt"("userId", "subject", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "question_attempt_testAttemptId_questionNumber_key" ON "question_attempt"("testAttemptId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "mistake_questionAttemptId_key" ON "mistake"("questionAttemptId");

-- CreateIndex
CREATE INDEX "mistake_userId_status_idx" ON "mistake"("userId", "status");

-- CreateIndex
CREATE INDEX "mistake_userId_type_idx" ON "mistake"("userId", "type");

-- CreateIndex
CREATE INDEX "mistake_userId_retryDueAt_idx" ON "mistake"("userId", "retryDueAt");

-- CreateIndex
CREATE INDEX "mistake_attachment_mistakeId_idx" ON "mistake_attachment"("mistakeId");

-- CreateIndex
CREATE INDEX "mistake_attachment_ocrStatus_idx" ON "mistake_attachment"("ocrStatus");

-- CreateIndex
CREATE UNIQUE INDEX "mistake_attachment_storageKey_key" ON "mistake_attachment"("storageKey");

-- CreateIndex
CREATE INDEX "mistake_retry_mistakeId_attemptedAt_idx" ON "mistake_retry"("mistakeId", "attemptedAt");

-- AddForeignKey
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempt" ADD CONSTRAINT "question_attempt_testAttemptId_fkey" FOREIGN KEY ("testAttemptId") REFERENCES "test_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempt" ADD CONSTRAINT "question_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake" ADD CONSTRAINT "mistake_questionAttemptId_fkey" FOREIGN KEY ("questionAttemptId") REFERENCES "question_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake" ADD CONSTRAINT "mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_attachment" ADD CONSTRAINT "mistake_attachment_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "mistake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_retry" ADD CONSTRAINT "mistake_retry_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "mistake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
