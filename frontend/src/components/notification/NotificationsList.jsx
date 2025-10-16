import { List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "../../utils/momentShort";

/**
 *
 * --------------------------------------
 * Renders a list of notifications with avatars and timestamps.
 *
 * Responsibilities:
 *  Displays sender info and action message
 *  Highlights unread notifications
 *  Handles click events for navigation or marking as read
 *
 * Props:
 * - notifications: array → list of notification objects
 * - isLoading: bool → shows AntD loader
 * - onClick: fn(notification) → callback when clicked
 */
export default function NotificationsList({
  notifications,
  isLoading,
  onClick,
}) {
  return (
    <List
      loading={isLoading}
      dataSource={notifications}
      locale={{ emptyText: "No notifications yet" }}
      renderItem={(n) => (
        <List.Item
          onClick={() => onClick(n)}
          style={{
            background: n.isRead ? "#fff" : "#f0f5ff",
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          {/*  Sender avatar */}
          <List.Item.Meta
            avatar={
              <Avatar
                src={n.fromUser?.avatar || undefined}
                icon={<UserOutlined />}
                alt={n.fromUser?.username || "User Avatar"}
              />
            }
            title={
              <span style={{ fontSize: 14 }}>
                {/*  Notification types */}
                {n.type === "new_post" && (
                  <span>
                    <b>{n.fromUser?.username}</b> posted a new post
                  </span>
                )}
                {n.type === "like_post" && (
                  <span>
                    <b>{n.fromUser?.username}</b> liked your post
                  </span>
                )}
                {n.type === "like_comment" && (
                  <span>
                    <b>{n.fromUser?.username}</b> liked your comment
                  </span>
                )}
                {n.type === "like_reply" && (
                  <span>
                    <b>{n.fromUser?.username}</b> liked your reply
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
                    Your post reached <b>{n.value}</b> views
                  </span>
                )}
                {n.type === "follow" && (
                  <span>
                    <b>{n.fromUser?.username}</b> followed you
                  </span>
                )}

                {/*  Timestamp */}
                <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>
                  {moment(n.createdAt).fromNow()}
                </span>
              </span>
            }
          />
        </List.Item>
      )}
    />
  );
}
