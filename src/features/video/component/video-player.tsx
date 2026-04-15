"use client";

import YouTube, { type YouTubeProps } from "react-youtube";

type VideoPlayerProps = {
  youtubeVideoId: string;
  title: string;
};

export function VideoPlayer({ youtubeVideoId, title }: VideoPlayerProps) {
  const opts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="aspect-video">
      <YouTube videoId={youtubeVideoId} title={title} opts={opts} className="h-full w-full" iframeClassName="h-full w-full" />
    </div>
  );
}
