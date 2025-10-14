// --- Ant Design ---
import { Input, Button, Space } from "antd";

/**
 *
 * --------------------------------------
 * Inline message editor used within MessageBubble.
 *
 * Responsibilities:
 *  Displays editable textarea for message content
 *  Provides Cancel and Save buttons
 *  Prevents propagation (avoids closing dropdown)
 *
 * Props:
 * - editText: current text value
 * - setEditText: setter for controlled input
 * - onCancel: cancel editing callback
 * - onSave: save edited message callback
 * - originalContent: message's original content (to disable Save if unchanged)
 */
export default function MessageEditor({
  editText,
  setEditText,
  onCancel,
  onSave,
  originalContent,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {/*  Editable input field */}
      <Input.TextArea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ fontSize: 14 }}
      />

      {/*  Action buttons */}
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
