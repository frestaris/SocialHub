import { List, Avatar } from "antd";
import { UserOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "../../utils/momentShort";

export default function MessageItem({ msg }) {
  const isMine = msg.isMine;

  const renderStatus = () => {
    if (!isMine) return null;

    const otherUserId = msg.otherUserId;

    const seen = msg.readBy?.map(String).includes(otherUserId?.toString());
    const delivered = msg.readBy?.length > 0 && !seen;

    if (seen) {
      // Blue double ticks
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <CheckOutlined
            style={{
              fontSize: 12,
              color: "#0a8cf0",
              position: "absolute",
              left: 0,
              opacity: 0.8,
            }}
          />
          <CheckOutlined
            style={{ fontSize: 12, color: "#0a8cf0", marginLeft: 6 }}
          />
        </span>
      );
    }

    if (delivered) {
      // Gray double ticks
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <CheckOutlined
            style={{
              fontSize: 12,
              color: "#888",
              position: "absolute",
              left: 0,
              opacity: 0.8,
            }}
          />
          <CheckOutlined
            style={{ fontSize: 12, color: "#888", marginLeft: 6 }}
          />
        </span>
      );
    }

    // Sent (single gray tick)
    return <CheckOutlined style={{ fontSize: 12, color: "#888" }} />;
  };

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
            {renderStatus()}
          </div>
        </div>
      </div>
    </List.Item>
  );
}
