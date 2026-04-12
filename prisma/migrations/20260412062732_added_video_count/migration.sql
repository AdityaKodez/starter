-- AlterTable
ALTER TABLE "playlist" ADD COLUMN     "videoCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "playlist_video" ALTER COLUMN "status" SET DEFAULT 'PENDING';
