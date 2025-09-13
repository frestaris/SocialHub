import { motion } from "framer-motion";
import { Tag } from "antd";

export default function MainVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        marginBottom: "40px",
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src="https://picsum.photos/1200/600?random=10"
        alt="Featured livestream"
        style={{ width: "100%", height: "auto" }}
      />
      <Tag
        color="red"
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          fontWeight: "bold",
        }}
      >
        LIVE
      </Tag>
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
        Featured Stream: CreatorXYZ
      </div>
    </motion.div>
  );
}
