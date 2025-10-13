import { useRef } from "react";
import { Input, Button, Space } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";

export default function ReplyForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
  editing,
  isUnchanged,
}) {
  const inputRef = useRef(null);

  return (
    <div style={{ paddingLeft: 38, marginTop: 4 }}>
      {/* Text Area */}
      <Input.TextArea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={editing ? "Edit your reply..." : "Write a reply..."}
        rows={2}
        status={error && !value?.trim() ? "error" : ""}
        style={{ flex: 1 }}
      />

      {/* Action Buttons */}
      <div style={{ marginTop: 4, textAlign: "right" }}>
        <Space>
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: 18, color: "#999" }} />}
            onClick={onCancel}
            size="small"
          />
          {/* Send/Update button */}
          <Button
            type="text"
            icon={
              <SendOutlined
                style={{
                  fontSize: 19,
                  color:
                    editing && isUnchanged
                      ? "#bbb"
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
            size="small"
          />
        </Space>
      </div>
    </div>
  );
}
