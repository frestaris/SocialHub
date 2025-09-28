import { useState } from "react";

export default function ArrowButton({ icon, onClick, position, disabled }) {
  const [hovered, setHovered] = useState(false);

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
