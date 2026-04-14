
export const VideoPlayer = ({
    videoId,
    id,
}: {
    videoId: string;
    id: string;
}) => {
    return (
        <div>
            <h1>Video Player</h1>
            <p>Video ID: {videoId}</p>
            <p>Playlist ID: {id}</p>
        </div>
    );
}
