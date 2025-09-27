export default function VideoPlayer({ src, title = "Video player" }) {
  const isYouTube = src?.includes("youtube.com") || src?.includes("youtu.be");

  // --- Normalize YouTube embed URL ---
  let embedUrl = src;
  if (isYouTube) {
    const match = src.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&]|$)/) || [];
    const videoId = match[1];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return (
    <div
      className="fade-slide-in"
      style={{
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div className="video-wrapper">
        {isYouTube ? (
          <iframe
            src={embedUrl}
            title={title}
            aria-label="YouTube video player"
            style={{ border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={src}
            controls
            title={title}
            aria-label="HTML5 video player"
          />
        )}
      </div>

      <style>
        {`
          .video-wrapper {
            position: relative;
            width: 100%;
          }

          .video-wrapper iframe,
          .video-wrapper video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .video-wrapper {
            padding-top: 56.25%;
          }

          /* Desktop (md and up): fullscreen minus navbar */
          @media (min-width: 768px) {
            .video-wrapper {
              padding-top: 0;
              min-height: calc(100vh - 164px);
            }
          }
        `}
      </style>
    </div>
  );
}
