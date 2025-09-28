export default function PreviewBox({ previewSrc }) {
  if (!previewSrc) return null;
  return (
    <div
      style={{
        position: "relative",
        marginBottom: 8,
        aspectRatio: "16/9",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <img
        src={previewSrc}
        alt="Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
