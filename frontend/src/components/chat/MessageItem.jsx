import { List, Avatar } from "antd";
import { UserOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "../../utils/momentShort";

export default function MessageItem({ msg }) {
  const isMine = msg.isMine;
  const otherUserId = msg.otherUserId;
  const hasBeenSeen = msg.readBy?.includes(otherUserId);
  const isDelivered =
    (!msg.pending && msg.readBy?.length === 1) ||
    (msg.readBy?.length > 1 && !hasBeenSeen);

  return (
    <List.Item
      data-message-id={msg._id}
      style={{
        display: "flex",
        alignItems: "flex-end",
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

      <div style={{ maxWidth: "75%", position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            background: isMine ? "#e6f0ff" : "#f5f5f5",
            color: "#000",
            padding: "6px 10px 4px 10px",
            borderRadius: 10,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            position: "relative",
            minHeight: 26,
          }}
        >
          {/* pointy tail */}
          <span
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              border: "8px solid transparent",
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
                    borderBottomColor: "#f5f5f5",
                    borderTop: 0,
                  }),
            }}
          />

          {/* content */}
          <span style={{ lineHeight: 1.4 }}>{msg.content}</span>

          {/* time + ticks */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <small style={{ color: "#8b8b8b", fontSize: 10, lineHeight: 1 }}>
              {moment(msg.createdAt).format("h:mm A")}
            </small>

            {isMine && (
              <div
                style={{
                  position: "relative",
                  width: 14,
                  height: 10,
                  display: "inline-block",
                }}
              >
                {hasBeenSeen ? (
                  <>
                    {/* back tick */}
                    <CheckOutlined
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        fontSize: 10,
                        color: "#34b7f1",
                        opacity: 0.9,
                      }}
                    />
                    {/* front tick */}
                    <CheckOutlined
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 3,
                        fontSize: 10,
                        color: "#34b7f1",
                      }}
                    />
                  </>
                ) : isDelivered ? (
                  <>
                    <CheckOutlined
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        fontSize: 10,
                        color: "#999",
                        opacity: 0.9,
                      }}
                    />
                    <CheckOutlined
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 3,
                        fontSize: 10,
                        color: "#999",
                      }}
                    />
                  </>
                ) : (
                  // ✅ single tick properly aligned in same container
                  <CheckOutlined
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 3,
                      fontSize: 10,
                      color: "#999",
                      opacity: 0.9,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </List.Item>
  );
}
