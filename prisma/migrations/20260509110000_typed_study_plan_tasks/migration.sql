-- CreateEnum
CREATE TYPE "StudyPlanTaskType" AS ENUM ('study', 'revision', 'test');

-- AlterTable
ALTER TABLE "StudyPlanTask"
ADD COLUMN "topicId" TEXT,
ADD COLUMN "type" "StudyPlanTaskType" NOT NULL DEFAULT 'study';

-- AddForeignKey
ALTER TABLE "StudyPlanTask" ADD CONSTRAINT "StudyPlanTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
