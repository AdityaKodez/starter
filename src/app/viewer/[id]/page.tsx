



export default async function PlaylistViewerPage({
    params
} : {
    params: {
        id: string
    }
}) {
    const { id } = await params;
  return <div>Playlist Viewer</div>
}