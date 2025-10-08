import { Avatar, Badge, Dropdown } from "antd";
import { UserOutlined, MoreOutlined } from "@ant-design/icons";
import moment from "moment";
import MessageStatusIcon from "./MessageItem/MessageStatusIcon";

/**
 * Props:
 * - conv: conversation object
 * - userId: current user's id
 * - unreadCounts: map of convId -> count
 * - onSelect: (conv) => void
 * - onDelete: (conversationId) => void
 * - userStatus: map of userId -> { online, lastSeen }
 */
export default function ChatListItem({
  conv,
  userId,
  unreadCounts,
  onSelect,
  onDelete,
  userStatus,
}) {
  const otherUsers = (conv?.participants || []).filter((p) => p._id !== userId);
  const name = otherUsers.map((p) => p.username).join(", ");
  const lastMsgObj = conv.lastMessage || null;

  const isMine = lastMsgObj?.sender?._id === userId;
  const hasBeenSeen = lastMsgObj?.readBy?.some((id) => id !== userId) || false;
  const isDelivered =
    lastMsgObj &&
    ((!lastMsgObj?.pending && lastMsgObj?.readBy?.length === 1) ||
      (lastMsgObj?.readBy?.length > 1 && !hasBeenSeen));

  const unread = unreadCounts?.[conv._id] || 0;

  const lastMessageText = conv.lastMessage?.deleted
    ? "This message was deleted"
    : conv.lastMessage?.content || "No messages yet";

  const time = conv.lastMessage?.createdAt
    ? moment(conv.lastMessage.createdAt).calendar(null, {
        sameDay: "h:mm A",
        lastDay: "[Yesterday]",
        lastWeek: "ddd",
        sameElse: "DD/MM/YYYY",
      })
    : "";

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

  const menuItems = [
    {
      key: "delete",
      label: <span style={{ color: "red" }}>Delete Chat</span>,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onDelete?.(conv._id);
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
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      onClick={() => onSelect?.(conv)}
    >
      <Badge count={unread} overflowCount={9} size="small" offset={[-4, 4]}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={otherUsers[0]?.avatar}
            icon={<UserOutlined />}
            size={40}
            style={{ flexShrink: 0, minWidth: 40, marginTop: 2 }}
          />
          {/* online status indicator */}
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
        {/* Top Row: Name + Time + Menu */}
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
            style={{ display: "flex", alignItems: "center", gap: 6 }}
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

            <div
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.05)")
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
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Bottom Row: Last message + ticks */}
        <div
          style={{
            fontSize: 13,
            color: conv.lastMessage?.deleted ? "#999" : "#666",
            fontStyle: conv.lastMessage?.deleted ? "italic" : "normal",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {isMine && lastMsgObj && !conv.lastMessage?.deleted && (
              <MessageStatusIcon
                hasBeenSeen={hasBeenSeen}
                isDelivered={isDelivered}
              />
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
              {lastMessageText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
