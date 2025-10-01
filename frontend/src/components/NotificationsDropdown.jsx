// --- Icons & UI ---
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Dropdown, List, Avatar } from "antd";

// --- Routing ---
import { useNavigate } from "react-router-dom";

// --- Redux (RTK Query API hooks) ---
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "../redux/notification/notificationApi";

// --- Utils ---
import moment from "../utils/momentShort";

export default function NotificationsDropdown() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const navigate = useNavigate();

  // --- Data prep ---
  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = (n) => {
    switch (n.type) {
      case "new_post":
      case "like":
      case "comment":
      case "view_milestone":
        navigate(`/post/${n.postId}`);
        break;
      case "reply":
      case "reply_on_post":
        navigate(`/post/${n.postId}?comment=${n.commentId}`);
        break;
      case "follow":
        navigate(`/profile/${n.fromUser._id}`);
        break;
      default:
        break;
    }
  };

  const overlay = (
    <div
      style={{
        width: 320,
        maxHeight: 420,
        overflowY: "auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: "8px 0",
      }}
    >
      <List
        loading={isLoading}
        dataSource={notifications}
        locale={{ emptyText: "No notifications yet" }}
        renderItem={(n) => (
          <List.Item
            onClick={() => handleClick(n)}
            style={{
              background: n.isRead ? "#fff" : "#f0f5ff",
              padding: "10px 14px",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = n.isRead ? "#fff" : "#f0f5ff")
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar src={n.fromUser?.avatar} icon={<UserOutlined />} />
              }
              title={
                <span style={{ fontSize: 14 }}>
                  {/* --- Notification messages --- */}
                  {n.type === "new_post" && (
                    <span>
                      <b>{n.fromUser?.username}</b> posted a new post
                    </span>
                  )}
                  {n.type === "like" && (
                    <span>
                      <b>{n.fromUser?.username}</b> liked your post
                    </span>
                  )}
                  {n.type === "comment" && (
                    <span>
                      <b>{n.fromUser?.username}</b> commented on your post
                    </span>
                  )}
                  {n.type === "reply" && (
                    <span>
                      <b>{n.fromUser?.username}</b> replied to your comment
                    </span>
                  )}
                  {n.type === "reply_on_post" && (
                    <span>
                      <b>{n.fromUser?.username}</b> replied to a comment on your
                      post
                    </span>
                  )}
                  {n.type === "view_milestone" && (
                    <span>
                      Your post reached <b>{n.value}</b> views 🎉
                    </span>
                  )}
                  {n.type === "follow" && (
                    <span>
                      <b>{n.fromUser?.username}</b> followed you
                    </span>
                  )}
                  {/* --- Timestamp --- */}
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>
                    {moment(n.createdAt).fromNow()}
                  </span>
                </span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => overlay}
      onOpenChange={(open) => open && markAsRead()}
    >
      <span>
        <Badge count={unreadCount} offset={[0, 6]}>
          <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>
      </span>
    </Dropdown>
  );
}
