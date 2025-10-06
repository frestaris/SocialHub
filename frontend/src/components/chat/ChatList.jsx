import { List, Avatar, Spin, Badge } from "antd";
import { UserOutlined, CheckOutlined } from "@ant-design/icons";
import { useGetConversationsQuery } from "../../redux/chat/chatApi";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../../redux/chat/chatSlice";
import { useEffect } from "react";
import moment from "moment";

export default function ChatList({
  onSelectConversation,
  enabled,
  userStatus,
}) {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });
  const conversations = data?.conversations || [];

  // 👀 Grab unread counts from chatSlice
  const unreadCounts = useSelector((s) => s.chat.unread);
  const dispatch = useDispatch();
  // ✅ When conversations load, hydrate unread counts from backend

  useEffect(() => {
    if (window.chatSocket?.connected) return;

    if (conversations.length > 0) {
      dispatch(
        setUnreadCounts((prev) => {
          const merged = { ...prev };
          conversations.forEach((c) => {
            const backendCount = c.unreadCount || 0;
            // Only hydrate if we don't already track this chat
            if (merged[c._id] === undefined) merged[c._id] = backendCount;
          });
          return merged;
        })
      );
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
            const lastMsgObj = conv.lastMessage || null;
            const lastMsg = lastMsgObj?.content || "No messages yet";
            const isMine = lastMsgObj?.sender?._id === data?.userId;
            const hasBeenSeen =
              lastMsgObj?.readBy?.some((id) => id !== data?.userId) || false;
            const isDelivered =
              lastMsgObj &&
              ((!lastMsgObj?.pending && lastMsgObj?.readBy?.length === 1) ||
                (lastMsgObj?.readBy?.length > 1 && !hasBeenSeen));

            const unread = unreadCounts[conv._id] || 0;
            const time = conv.lastMessage?.createdAt
              ? moment(conv.lastMessage.createdAt).calendar(null, {
                  sameDay: "h:mm A",
                  lastDay: "[Yesterday]",
                  lastWeek: "ddd",
                  sameElse: "DD/MM/YYYY",
                })
              : "";

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
                <Badge
                  count={unread}
                  overflowCount={9}
                  size="small"
                  offset={[-4, 4]}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
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

                    {/* ✅ online status indicator */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: userStatus?.[otherUsers[0]?._id]?.online
                          ? "#4caf50"
                          : "#9e9e9e",
                        border: "2px solid white",
                        boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </Badge>

                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {/* --- Top Row: Name + Time --- */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#222",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "70%",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: unread ? "#1677ff" : "#999",
                        fontWeight: unread ? 600 : 400,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {time}
                    </span>
                  </div>

                  {/* --- Bottom Row: Last message + ticks --- */}
                  <div
                    style={{
                      fontSize: 13,
                      color: "#666",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {isMine && lastMsgObj && (
                        <span
                          style={{
                            position: "relative",
                            width: 14,
                            height: 10,
                          }}
                        >
                          {hasBeenSeen ? (
                            <>
                              <CheckOutlined
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  fontSize: 10,
                                  color: "#34b7f1",
                                  opacity: 0.9,
                                }}
                              />
                              <CheckOutlined
                                style={{
                                  position: "absolute",
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
                                  left: 0,
                                  fontSize: 10,
                                  color: "#999",
                                  opacity: 0.9,
                                }}
                              />
                              <CheckOutlined
                                style={{
                                  position: "absolute",
                                  left: 3,
                                  fontSize: 10,
                                  color: "#999",
                                }}
                              />
                            </>
                          ) : (
                            <CheckOutlined
                              style={{
                                position: "absolute",
                                left: 3,
                                fontSize: 10,
                                color: "#999",
                                opacity: 0.9,
                              }}
                            />
                          )}
                        </span>
                      )}

                      <span
                        style={{
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {lastMsg}
                      </span>
                    </div>
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
