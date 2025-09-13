import { motion } from "framer-motion";

export default function VideoPlayer({ src, title }) {
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
      <img src={src} alt={title} style={{ width: "100%", height: "auto" }} />
    </motion.div>
  );
}
