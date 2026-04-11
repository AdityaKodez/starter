"use client";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowRight } from "@tabler/icons-react";
import Avvvatars from "avvvatars-react";
import { IconBoxArchive } from "nucleo-glass";
import { usePlaylistVeiw } from "./hooks/use-playlist";

export const PlaylistViewer = () => {
	const { data: playlists } = usePlaylistVeiw();

	return (
		<Card className="w-full mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Your Playlists</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    View and manage your YouTube playlists converted into interactive courses.
                </CardDescription>
                <CardAction>
                    {/* Future action buttons like "Create New Playlist" can go here */}
                    <Button variant="secondary" size="lg" className="ml-auto">
                        
                        View All
                        <IconArrowRight className="size-4" />
                    </Button>
                </CardAction>
            </CardHeader>
			<CardContent>

				{playlists && playlists.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{playlists.map((playlist) => (
							<Card key={playlist.id} className="border rounded-lg p-0">
								<CardContent className="p-1 pb-4">
									{/* Placeholder for playlist thumbnail */}
									<div className="h-34 rounded-lg w-full bg-primary flex items-center justify-center gap-4">
										<Avvvatars style="shape" size={80} value={playlist.title} />
										<p className="text-center text-xl font-mono text-accent text-medium font-bold mt-2">
											{playlist.title}
										</p>
									</div>

                                     <CardHeader className="px-2 pt-4">
                                        <CardTitle className="text-lg font-bold">{playlist.title}</CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            {playlist.videos.length} videos
                                        </CardDescription>
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
