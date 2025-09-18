import { motion } from "framer-motion";

export default function VideoPlayer({ src, title }) {
  const isYouTube = src?.includes("youtube.com") || src?.includes("youtu.be");

  // Normalize YouTube embed URL
  let embedUrl = src;
  if (isYouTube) {
    const videoIdMatch = src.match(/(?:v=|youtu\.be\/)([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : src;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
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
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={src} controls />
        )}
      </div>

      <style>
        {`
          .video-wrapper {
            position: relative;
            width: 100%;
          }

          /* Mobile & tablets: keep 16:9 ratio */
          .video-wrapper iframe,
          .video-wrapper video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .video-wrapper {
            padding-top: 56.25%; /* 16:9 ratio */
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
    </motion.div>
  );
}
