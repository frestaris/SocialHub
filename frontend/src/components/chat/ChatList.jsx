import { List, Avatar, Spin, Badge, Dropdown, Modal } from "antd";
import {
  UserOutlined,
  CheckOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useDeleteConversationMutation,
  useGetConversationsQuery,
} from "../../redux/chat/chatApi";
import { handleSuccess, handleError } from "../../utils/handleMessage";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../../redux/chat/chatSlice";
import { useEffect, useMemo } from "react";
import moment from "moment";

export default function ChatList({
  onSelectConversation,
  enabled,
  userStatus,
}) {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });
  const conversations = useMemo(
    () => data?.conversations || [],
    [data?.conversations]
  );
  const unreadCounts = useSelector((s) => s.chat.unread);
  const dispatch = useDispatch();
  const [deleteConversation] = useDeleteConversationMutation();

  // Hydrate unread counts from backend on first load
  useEffect(() => {
    if (!conversations?.length) return;

    // Build an object of missing conversations only
    const missing = {};
    conversations.forEach((c) => {
      if (unreadCounts[c._id] === undefined) {
        missing[c._id] = c.unreadCount || 0;
      }
    });

    // Only dispatch if there are actually new entries
    if (Object.keys(missing).length > 0) {
      dispatch(setUnreadCounts({ ...unreadCounts, ...missing }));
    }
  }, [conversations, dispatch]);

  // Handle deletion confirmation
  const handleDelete = (conversationId) => {
    Modal.confirm({
      title: "Delete Conversation",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this chat? This will remove it only from your chat list.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await deleteConversation(conversationId).unwrap();
          handleSuccess("Conversation deleted");
        } catch (err) {
          console.error("Delete conversation error:", err);
          handleError("Failed to delete conversation");
        }
      },
    });
  };

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

            // Dropdown menu items
            const menuItems = [
              {
                key: "delete",
                label: <span style={{ color: "red" }}>Delete Chat</span>,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  handleDelete(conv._id);
                },
              },
            ];

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
                  {/* --- Top Row: Name + Time + Menu --- */}
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

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
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

                      {/* ⋯ dropdown icon */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(0,0,0,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          width: 32,
                          borderRadius: 6,
                          transition: "background 0.2s ease",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <Dropdown
                          menu={{ items: menuItems }}
                          placement="bottomRight"
                          trigger={["click"]}
                          arrow
                          getPopupContainer={() => document.body}
                        >
                          <MoreOutlined
                            style={{
                              fontSize: 18,
                              color: "#888",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#1677ff")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#888")
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                    </div>
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
