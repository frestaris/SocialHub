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

      <div style={{ maxWidth: "75%", textAlign: "left", position: "relative" }}>
        <div
          style={{
            display: "inline-block",
            background: isMine ? "#e6f0ff" : "#e9e9e9",
            color: "#000",
            padding: "6px 10px",
            borderRadius: 8,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            position: "relative",
          }}
        >
          {/* pointy tail */}
          <span
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              border: "10px solid transparent",
              ...(isMine
                ? {
                    bottom: 0,
                    right: -5,
                    borderLeftColor: "#e6f0ff",
                    borderRight: 0,
                    borderTop: 0,
                  }
                : {
                    top: 0,
                    left: -5,
                    borderBottomColor: "#e9e9e9",
                    borderTop: 0,
                  }),
            }}
          ></span>

          {msg.content}

          {/* Timestamp */}
          <span
            style={{
              marginLeft: 6,
              color: "#777",
              fontSize: 10,
              alignSelf: "flex-end",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {msg.createdAt ? moment(msg.createdAt).format("h:mm A") : ""}
          </span>
        </div>
      </div>
    </List.Item>
  );
}
