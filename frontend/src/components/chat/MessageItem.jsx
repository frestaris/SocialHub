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
        justifyContent: "flex-start",
      }}
    >
      {/* Avatar */}
      <Avatar
        src={msg.sender?.avatar}
        icon={<UserOutlined />}
        size={28}
        style={{ flexShrink: 0 }}
      />

      {/* Message content */}
      <div style={{ flex: 1, textAlign: "left" }}>
        {/* Sender name */}
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "#222",
            marginBottom: 2,
            wordBreak: "break-all",
          }}
        >
          {msg.sender?.username || "Unknown"}
        </div>

        {/* Message bubble */}
        <div
          style={{
            display: "inline-block",
            background: isMine ? "#e6f0ff" : "#f5f5f5",
            color: "#000",
            padding: "6px 10px",
            borderRadius: 8,
            maxWidth: "260px",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.pending ? `${msg.content} (sending...)` : msg.content}
        </div>

        {/* Timestamp */}
        <small
          style={{
            color: "#888",
            marginTop: 2,
            display: "block",
            fontSize: 11,
          }}
        >
          {msg.createdAt ? moment(msg.createdAt).fromNow() : "just now"}
          {msg.seenAt && ` • Seen`}
        </small>
      </div>
    </List.Item>
  );
}
