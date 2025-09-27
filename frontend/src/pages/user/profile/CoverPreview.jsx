import { useState } from "react";

export default function CoverPreview({ src, onOffsetChange }) {
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartY(e.clientY - offsetY);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newOffset = e.clientY - startY;
      setOffsetY(newOffset);
      if (onOffsetChange) onOffsetChange(newOffset);
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      style={{
        marginTop: 12,
        width: "100%",
        height: 140,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        background: "#f0f0f0",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        alt="Cover preview"
        style={{
          width: "100%",
          transform: `translateY(${offsetY}px)`,
          cursor: "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        draggable={false}
      />
    </div>
  );
}
