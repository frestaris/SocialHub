export const fetchYouTubeMetadata = async (url) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  if (!match) return null;

  const videoId = match[1];
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items[0];
    if (!item) return null;

    // Helper: convert ISO8601 duration to seconds
    const parseDuration = (iso) => {
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match[1] || 0, 10);
      const minutes = parseInt(match[2] || 0, 10);
      const seconds = parseInt(match[3] || 0, 10);
      return hours * 3600 + minutes * 60 + seconds;
    };

    return {
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(item.contentDetails.duration),
    };
  } catch (err) {
    console.error("YouTube API fetch failed:", err);
    return null;
  }
};
