import { Input, Button, Space } from "antd";

export default function MessageEditor({
  editText,
  setEditText,
  onCancel,
  onSave,
  originalContent,
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <Input.TextArea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ fontSize: 14 }}
      />
      <Space style={{ alignSelf: "flex-end" }}>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          disabled={editText.trim() === originalContent.trim()}
          onClick={onSave}
        >
          Save
        </Button>
      </Space>
    </div>
  );
}
