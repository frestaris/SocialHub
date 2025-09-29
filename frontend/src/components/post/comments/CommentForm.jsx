import { Input, Button } from "antd";

export default function CommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  editing,
  error,
  isUnchanged,
}) {
  return (
    <>
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={editing ? "Edit your comment..." : "Write a comment..."}
        autoSize={{ minRows: 2, maxRows: 4 }}
        status={error ? "error" : ""}
      />
      <div style={{ marginTop: 8, textAlign: "right" }}>
        {editing && (
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          onClick={onSubmit}
          loading={loading}
          disabled={isUnchanged}
        >
          {editing ? "Update" : "Comment"}
        </Button>
      </div>
    </>
  );
}
