import { List, Avatar, Spin, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetConversationsQuery } from "../../redux/chat/chatApi";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../../redux/chat/chatSlice";
import { useEffect } from "react";

export default function ChatList({ onSelectConversation, enabled }) {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });
  const conversations = data?.conversations || [];

  // 👀 Grab unread counts from chatSlice
  const unreadCounts = useSelector((s) => s.chat.unread);
  const dispatch = useDispatch();
  // ✅ When conversations load, hydrate unread counts from backend
  useEffect(() => {
    if (conversations.length > 0) {
      const initialUnread = {};
      conversations.forEach((c) => {
        initialUnread[c._id] = c.unreadCount || 0;
      });
      dispatch(setUnreadCounts(initialUnread));
    }
  }, [conversations, dispatch]);
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

            const unread = unreadCounts[conv._id] || 0;

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
                <Badge count={unread} size="small" offset={[-4, 4]}>
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
                </Badge>

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
