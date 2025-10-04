import { List, Avatar, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetConversationsQuery } from "../../redux/chat/chatApi";

export default function ChatList({ onSelectConversation, enabled }) {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });
  const conversations = data?.conversations || [];

  const listContainerStyle = {
    padding: "5px",
    boxSizing: "border-box",
    background: "#fff",
    height: "100%",
    overflowY: "auto",
  };

  const itemStyle = {
    cursor: "pointer",
    padding: "8px 10px",
    marginBottom: "6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    transition: "background 0.2s",
  };

  const hoverStyle = { background: "#f5f5f5" };

  return (
    <div style={listContainerStyle}>
      {isLoading ? (
        <Spin style={{ marginTop: 40 }} />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conv) => {
            const otherUsers = conv.participants.filter(
              (p) => p._id !== data?.userId
            );
            const name = otherUsers.map((p) => p.username).join(", ");
            const lastMsg = conv.lastMessage?.content || "No messages yet";

            return (
              <div
                key={conv._id}
                style={itemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = hoverStyle.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => onSelectConversation?.(conv)}
              >
                <Avatar
                  src={otherUsers[0]?.avatar}
                  icon={<UserOutlined />}
                  size={40}
                  style={{
                    flexShrink: 0,
                    minWidth: 40,
                    marginTop: 2,
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#222",
                      marginBottom: 2,
                    }}
                  >
                    {name}
                  </div>

                  {/* Two-line text clamp */}
                  <div
                    style={{
                      fontSize: 13,
                      color: "#888",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {lastMsg}
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
