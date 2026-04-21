-- Backfill legacy rows that were created before youtubeVideoId became required.
WITH candidate_ids AS (
  SELECT
    pv."id",
    pv."playlistId",
    COALESCE(
      NULLIF(substring(pv."sourceUrl" FROM '(?:[?&]v=|youtu\\.be/)([A-Za-z0-9_-]{6,})'), ''),
      CONCAT('legacy_', pv."id")
    ) AS raw_video_id
  FROM "playlist_video" pv
  WHERE pv."youtubeVideoId" IS NULL
),
resolved_ids AS (
  SELECT
    c."id",
    CASE
      WHEN row_number() OVER (
        PARTITION BY c."playlistId", c.raw_video_id
        ORDER BY c."id"
      ) = 1
      AND NOT EXISTS (
        SELECT 1
        FROM "playlist_video" existing
        WHERE existing."playlistId" = c."playlistId"
          AND existing."youtubeVideoId" = c.raw_video_id
      )
        THEN c.raw_video_id
      ELSE CONCAT(c.raw_video_id, '_', substring(c."id" FROM 1 FOR 8))
    END AS final_video_id
  FROM candidate_ids c
)
UPDATE "playlist_video" pv
SET "youtubeVideoId" = r.final_video_id
FROM resolved_ids r
WHERE pv."id" = r."id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "playlist_video"
    WHERE "youtubeVideoId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot set playlist_video.youtubeVideoId to NOT NULL because some rows are still NULL';
  END IF;
END
$$;

ALTER TABLE "playlist_video"
ALTER COLUMN "youtubeVideoId" SET NOT NULL;
