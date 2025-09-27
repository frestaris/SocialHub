import { useState, useRef, useEffect } from "react";

export default function CoverPreview({ src, onOffsetChange }) {
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const imgRef = useRef(null);
  const [imgHeight, setImgHeight] = useState(1);

  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.naturalHeight);
    }
  }, [src]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartY(e.clientY - offsetY);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const newOffset = e.clientY - startY;
    setOffsetY(newOffset);

    const percent = (newOffset / imgHeight) * 100;

    if (onOffsetChange) {
      onOffsetChange(Number(percent.toFixed(2)));
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      style={{
        marginTop: 12,
        width: "100%",
        maxHeight: 400,
        overflowY: "auto",
        position: "relative",
        borderRadius: 8,
        background: "#f0f0f0",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Scrollable image */}
      <img
        ref={imgRef}
        src={src}
        alt="Cover preview"
        style={{
          width: "100%",
          display: "block",
          userSelect: "none",
        }}
        draggable={false}
        onLoad={(e) => setImgHeight(e.target.naturalHeight)}
      />

      {/* Draggable highlight overlay */}
      <div
        style={{
          position: "absolute",
          top: `${offsetY}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "98%",
          height: 140,
          border: "2px dashed #1677ff",
          borderRadius: 8,
          background: "rgba(22, 119, 255, 0.15)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "top 0.2s ease",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* drag handle indicator */}
        <div
          style={{
            position: "absolute",
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 6,
            borderRadius: 3,
            background: "#1677ff",
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}
