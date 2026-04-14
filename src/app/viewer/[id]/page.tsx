
import { getQueryClient, trpc } from "@/trpc/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/utils/auth-utils";
type ViewerPageProps = {
    params: Promise<{ id: string }>;
};

export async function getPlaylistData(id: string) {
    const queryClient = getQueryClient();
    return queryClient.fetchQuery(trpc.playlist.byId.queryOptions({ id }));
}

export async function generateMetadata({ params }: ViewerPageProps): Promise<Metadata> {
    const { id } = await params;

    try {
        const playlist = await getPlaylistData(id);

        return {
            title: `${playlist.title} | Coursa`,
            description: `Viewing playlist: ${playlist.title}`,
        };
    } catch {
        return {
            title: "Playlist Viewer | Coursa",
            description: "Viewing playlist",
        };
    }
}

export default async function PlaylistViewerPage({ params }: ViewerPageProps) {
    await requireAuth();
    const { id } = await params;
    const playlist = await getPlaylistData(id).catch((error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("not authenticated")) {
            redirect("/");
        }

        return null;
    });

    if (!playlist) {
        notFound();
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{playlist.title}</h1>
                <p className="text-sm text-muted-foreground">
                    {playlist.ownerName} • {playlist.videoCount} videos
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                Lessons are listed in the left sidebar. Pick any video title to continue.
            </p>
        </div>
    );
}