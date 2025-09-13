import { motion } from "framer-motion";
import { Tag } from "antd";

export default function StreamPlayer({ img, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        flex: 2,
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img src={img} alt={title} style={{ width: "100%", height: "auto" }} />
      <Tag
        color="red"
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "4px 8px",
          borderRadius: "6px",
        }}
      >
        LIVE
      </Tag>
    </motion.div>
  );
}
