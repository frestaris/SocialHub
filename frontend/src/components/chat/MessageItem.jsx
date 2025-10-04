import { List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "../../utils/momentShort";

export default function MessageItem({ msg }) {
  const isMine = msg.isMine;

  return (
    <List.Item
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "6px 0",
        gap: 8,
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      {!isMine && (
        <Avatar
          src={msg.sender?.avatar}
          icon={<UserOutlined />}
          size={28}
          style={{ flexShrink: 0 }}
        />
      )}

      <div style={{ maxWidth: "75%", textAlign: "left" }}>
        {!isMine && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#222",
              marginBottom: 2,
            }}
          >
            {msg.sender?.username || "Unknown"}
          </div>
        )}

        <div
          style={{
            display: "inline-block",
            background: isMine ? "#e6f0ff" : "#f5f5f5",
            color: "#000",
            padding: "6px 10px",
            borderRadius: 8,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.content}

          {/* Timestamp + ticks */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <small style={{ color: "#888", fontSize: 11 }}>
              {msg.createdAt ? moment(msg.createdAt).fromNow() : "just now"}
            </small>
          </div>
        </div>
      </div>
    </List.Item>
  );
}
