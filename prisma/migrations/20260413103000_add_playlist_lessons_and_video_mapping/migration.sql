-- AlterTable
ALTER TABLE "playlist_video"
ADD COLUMN "youtubeVideoId" TEXT,
ADD COLUMN "lessonId" TEXT;

-- CreateTable
CREATE TABLE "playlist_lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_lesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlist_lesson_playlistId_idx" ON "playlist_lesson"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_lesson_playlistId_order_key" ON "playlist_lesson"("playlistId", "order");

-- CreateIndex
CREATE INDEX "playlist_video_lessonId_idx" ON "playlist_video"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_video_playlistId_youtubeVideoId_key" ON "playlist_video"("playlistId", "youtubeVideoId");

-- AddForeignKey
ALTER TABLE "playlist_lesson" ADD CONSTRAINT "playlist_lesson_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_video" ADD CONSTRAINT "playlist_video_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "playlist_lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
