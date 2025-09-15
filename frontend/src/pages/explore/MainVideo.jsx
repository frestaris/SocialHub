import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Grid } from "antd";
const { useBreakpoint } = Grid;

export default function MainVideo({ video }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!video?._id) return null;

  const duration = video.duration || 0;
  return (
    <Link to={`/video/${video._id}`} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          maxHeight: "70vh",
          aspectRatio: "16/9",
          width: "100%",
          marginBottom: "40px",
          background: "#000",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src={video.thumbnail || "/fallback-thumbnail.jpg"}
            alt={video.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: isMobile ? "cover" : "contain",
            }}
          />

          {duration > 0 && (
            <span
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                fontSize: "13px",
                padding: "3px 6px",
                borderRadius: "4px",
              }}
            >
              {Math.floor(duration / 60)}:
              {(duration % 60).toString().padStart(2, "0")}
            </span>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            color: "#fff",
            background: "rgba(0,0,0,0.5)",
            padding: "6px 12px",
            borderRadius: "6px",
          }}
        >
          {video.title} — {video.creatorId?.username || "Unknown"}
        </div>
      </motion.div>
    </Link>
  );
}
