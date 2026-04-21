-- Ensure one artifact type exists per video to prevent duplicate summary artifacts.
CREATE UNIQUE INDEX IF NOT EXISTS "artifact_playlistVideoId_type_key"
ON "artifact"("playlistVideoId", "type");
