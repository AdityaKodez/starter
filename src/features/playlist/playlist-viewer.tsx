"use client";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Avatar from "boring-avatars";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconArrowRight, IconCopy, IconDotsVertical, IconTrash } from "@tabler/icons-react";

import { IconBoxArchive } from "nucleo-glass";
import { toast } from "sonner";
import { useWarningDialog } from "@/components/providers/warning-dialog-provider";
import { usePlaylistDelete, usePlaylistVeiw } from "./hooks/use-playlist";
import { VideoProgress } from "./component/video-progress";
import Link from "next/link";

export const PlaylistViewer = () => {
	const { data: playlists, refetch } = usePlaylistVeiw();
	const deletePlaylist = usePlaylistDelete();
	const warningDialog = useWarningDialog();
const avatarPalette = [
  "#3A2F00", // deep amber-brown (replaces navy depth)
  "#6B5500", // dark yellow
  "#EAB308", // primary yellow (anchor)
  "#FACC15", // light yellow
  "#FEFCE8"  // soft warm background
];

	const handleDelete = async (playlistId: string) => {
		const confirmed = await warningDialog({
			title: "Delete this playlist?",
			description: "This action is permanent and cannot be undone.",
			confirmLabel: "Delete",
			cancelLabel: "Keep playlist",
			destructive: true,
		});

		if (!confirmed) {
			return;
		}

		await deletePlaylist.mutateAsync({ id: playlistId });
		await refetch();
	};

	const handleCopyLink = async (sourceUrl: string) => {
		try {
			await navigator.clipboard.writeText(sourceUrl);
			toast.success("Playlist link copied");
		} catch {
			toast.error("Could not copy link");
		}
	};

	return (
		<Card className="w-full mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Playlists</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    View and manage your YouTube playlists converted into interactive courses.
                </CardDescription>
                <CardAction>
                   {/* TODO : MAKE THIS BUTTON FUCKING WORK */}
                    <Button variant="secondary" size="lg" className="ml-auto">
                        
                        View All
                        <IconArrowRight className="size-4" />
                    </Button>
                </CardAction>
            </CardHeader>
			<CardContent>

				{playlists && playlists.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{playlists.map((playlist) => (
							<Card key={playlist.id} className="border rounded-lg p-0">
								<CardContent className="p-2 pb-4">
									{/* Placeholder for playlist thumbnail */}
									<div className="h-34 rounded-sm w-full bg-accent/90  flex items-center justify-center gap-2">
										<Avatar name={playlist.title} variant="pixel" colors={avatarPalette} />
										
										<p className="text-center text-md text-medium font-geist-sans font-bold mt-2">
											{playlist.title.length > 20 ? playlist.title.slice(0, 20) + "..." : playlist.title}
										</p>
									</div>

									<CardHeader className="px-2 pt-6 pb-0">
										<Link href={`/viewer/${playlist.id}`} className="truncate hover:underline">
											<CardTitle className="text-md font-bold truncate">
												{playlist.title}
											</CardTitle>
										</Link>
										<CardDescription className="text-xs text-muted-foreground ">
											<VideoProgress total={playlist.
											videoCount} progress={1}
											  />
										</CardDescription>
										<CardAction>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon-xs" aria-label="Playlist actions">
														<IconDotsVertical className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-48">
													<DropdownMenuItem onSelect={() => void handleCopyLink(playlist.sourceUrl)}>
														<IconCopy className="size-4" />
														Copy source link
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onSelect={() => void handleDelete(playlist.id)}
														disabled={deletePlaylist.isPending}
													>
														<IconTrash className="size-4" />
														Delete playlist
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</CardAction>
									</CardHeader>

								</CardContent>
							
							</Card>
						))}
					</div>
				) : (
					<EmptyState
						icon={IconBoxArchive}
						title="No playlists found"
						description="You haven't created any playlists yet."
					/>
				)}
			</CardContent>
		</Card>
	);
};
