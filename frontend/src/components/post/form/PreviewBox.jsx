import { DeleteOutlined } from "@ant-design/icons";

export default function PreviewBox({ previewSrc, onRemove }) {
  if (!previewSrc || previewSrc.length === 0) return null;

  const images = Array.isArray(previewSrc) ? previewSrc : [previewSrc];
  const count = images.length;

  let gridTemplate = "1fr";
  if (count === 2) gridTemplate = "1fr 1fr";
  if (count >= 3) gridTemplate = "1fr 1fr";

  const displayImages = count > 4 ? images.slice(0, 4) : images;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: "8px",
        marginBottom: 12,
      }}
    >
      {displayImages.map((src, idx) => (
        <div
          key={idx}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            overflow: "hidden",
            borderRadius: "8px",
            position: "relative",
          }}
        >
          <img
            src={src}
            alt={`Preview ${idx + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Delete icon */}
          {onRemove && (
            <div
              onClick={() => onRemove(idx)}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <DeleteOutlined style={{ color: "#fff", fontSize: 16 }} />
            </div>
          )}
          {/* Overlay if more than 4 */}
          {idx === 3 && count > 4 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +{count - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
