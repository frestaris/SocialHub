import { useState } from "react";

/**
 *
 * --------------------------------------
 * A reusable circular button used for carousel navigation.
 *
 * Responsibilities:
 * Renders a left/right arrow button
 * Handles hover color transitions
 * Automatically hides when disabled
 *
 * Props:
 * - icon: React node for the arrow icon
 * - onClick: click handler
 * - position: "left" | "right" for placement
 * - disabled: boolean, hides button when true
 */
export default function ArrowButton({ icon, onClick, position, disabled }) {
  const [hovered, setHovered] = useState(false);

  // Skip rendering if disabled (Ant Design Carousel passes disabled state)
  if (disabled) return null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: hovered ? "#d9d9d9" : "#e5e5e5",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        ...(position === "left" ? { left: 10 } : { right: 10 }),
      }}
    >
      {icon}
    </div>
  );
}
