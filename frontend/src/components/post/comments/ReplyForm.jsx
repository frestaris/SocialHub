import { Input, Button } from "antd";

export default function ReplyForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
  editing, // 👈 add this
}) {
  return (
    <div style={{ paddingLeft: 38, marginTop: 4 }}>
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={editing ? "Edit your reply..." : "Write a reply..."}
        autoSize={{ minRows: 2, maxRows: 4 }}
        status={error && !value?.trim() ? "error" : ""}
      />
      <div style={{ marginTop: 4, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={onSubmit}
          loading={loading}
        >
          {editing ? "Update" : "Reply"}
        </Button>
      </div>
    </div>
  );
}
