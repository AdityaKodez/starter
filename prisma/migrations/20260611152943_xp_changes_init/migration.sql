-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('xp', 'gems');

-- AlterTable
ALTER TABLE "StudyPlanTask" ADD COLUMN     "rewardAmount" INTEGER,
ADD COLUMN     "rewardType" "RewardType";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "gems" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;
