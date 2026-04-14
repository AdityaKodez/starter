import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/features/video/component/video-player";
import { requireAuth } from "@/utils/auth-utils";
import { notFound } from "next/navigation";
import { getPlaylistData } from "../../page";
import { VideoHeader } from "@/features/video/component/video-header";

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

    const youtubeVideoId = video.youtubeVideoId || resolveYoutubeVideoId(video.sourceUrl);
    if (!youtubeVideoId) {
        notFound();
    }

    return (
        <div className="space-y-4 p-4 sm:p-6">
        <VideoHeader title={video.title} />
            <div className="overflow-hidden rounded-xl border bg-card max-w-4xl">
                <VideoPlayer youtubeVideoId={youtubeVideoId} title={video.title} />
            </div>

            <div>
                <Button type="button">Add Note</Button>
            </div>
        </div>
    );
}