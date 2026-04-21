import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AppBottom } from "@/components/app-bottom";
import { VideoHeader } from "@/features/video/component/video-header";
import { VideoPlayer } from "@/features/video/component/video-player";
import { MarkdownRenderer } from "@/utils/markdown";
import { requireAuth } from "@/utils/auth-utils";
import { notFound } from "next/navigation";
import { getPlaylistData } from "../../page";

type VideoPageProps = {
    params: Promise<{
        id: string;
        videoId: string;
    }>;
};

function resolveYoutubeVideoId(sourceUrl: string) {
    try {
        const url = new URL(sourceUrl);
        return url.searchParams.get("v") ?? "";
    } catch {
        return "";
    }
}

const dummySummaryMarkdown = `
## Dummy Summary

This is placeholder markdown for the lesson summary area.

- Key idea one
- Key idea two
- Key idea three

> Replace this with the generated lesson summary once that data is ready.
`;

export default async function VideoPage({ params }: VideoPageProps) {
    await requireAuth();
    const { id, videoId } = await params;

    const playlist = await getPlaylistData(id).catch(() => null);
    if (!playlist) {
        notFound();
    }

    const video = playlist.videos.find((item) => item.id === videoId);
    if (!video) {
        notFound();
    }

    const currentVideoIndex = playlist.videos.findIndex((item) => item.id === videoId);
    const previousVideo = currentVideoIndex > 0 ? playlist.videos[currentVideoIndex - 1] : null;
    const nextVideo =
        currentVideoIndex >= 0 && currentVideoIndex < playlist.videos.length - 1
            ? playlist.videos[currentVideoIndex + 1]
            : null;

    const lesson = playlist.lessons.find((item) =>
        item.videos.some((lessonVideo) => lessonVideo.id === videoId),
    );

    const youtubeVideoId = video.youtubeVideoId || resolveYoutubeVideoId(video.sourceUrl);
    if (!youtubeVideoId) {
        notFound();
    }

    const summaryMarkdown = lesson?.summary?.trim() || dummySummaryMarkdown;

    return (
        <>
  
  <div className="space-y-6 p-2 sm:p-6 w-full max-w-6xl mx-auto">
            <VideoHeader title={video.title} />
            <div className="overflow-hidden rounded-xl border bg-card w-full ">
                <VideoPlayer youtubeVideoId={youtubeVideoId} title={video.title} />
            </div>
            <Card className="w-full">
                <CardHeader className="space-y-2 border-b">
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                        {lesson?.title
                            ? `Notes for ${lesson.title}`
                            : "Markdown-rendered lesson notes will appear here."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="[&>*+*]:mt-4">
                        <MarkdownRenderer content={summaryMarkdown} />
                    </div>
                </CardContent>
            </Card>
        </div>
                    <AppBottom
                previousHref={previousVideo ? `/viewer/${id}/video/${previousVideo.id}` : undefined}
                nextHref={nextVideo ? `/viewer/${id}/video/${nextVideo.id}` : undefined}
              
            />
                  </>
    );
}
