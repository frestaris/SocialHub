import { useRef } from "react";
import { Input, Button, Space } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";

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
  const inputRef = useRef(null);

  return (
    <>
      <div style={{ position: "relative", width: "100%", marginBottom: 40 }}>
        {/* Text Area */}
        <Input.TextArea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={editing ? "Edit your comment..." : "Write a comment..."}
          rows={2}
          status={error ? "error" : ""}
        />

        {/* 📤 Send icon inside textarea */}
        <Button
          type="text"
          icon={
            <SendOutlined
              style={{
                fontSize: 18,
                color: editing
                  ? isUnchanged
                    ? "#bbb"
                    : "#1677ff"
                  : value.trim()
                  ? "#1677ff"
                  : "#bbb",
                transform: !editing ? "rotate(-15deg)" : "none",
              }}
            />
          }
          onClick={onSubmit}
          disabled={editing ? isUnchanged : !value.trim()}
          loading={loading}
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        />
      </div>

      {/* Action Buttons (only for edit mode) */}
      {editing && (
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Space>
            <Button
              type="text"
              icon={<CloseOutlined style={{ fontSize: 18, color: "#999" }} />}
              onClick={onCancel}
              disabled={loading}
            />
          </Space>
        </div>
      )}
    </>
  );
}
