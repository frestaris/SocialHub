import { useState } from "react";
import { BellOutlined } from "@ant-design/icons";
import { Badge, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "../../redux/notification/notificationApi";
import NotificationsList from "./NotificationsList";

export default function NotificationsDropdown() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const navigate = useNavigate();

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [open, setOpen] = useState(false);

  const handleClick = (n) => {
    // Guard against missing postId
    if (!n.postId && n.type !== "follow") {
      console.warn("Notification missing postId", n);
      return;
    }
    switch (n.type) {
      case "new_post":
      case "like_post":
      case "comment":
      case "view_milestone":
        // Post-related notification
        navigate(`/post/${n.postId}`);
        break;

      case "like_comment":
      case "reply":
      case "reply_on_post":
        // Goes to post + highlights comment
        navigate(`/post/${n.postId}?comment=${n.commentId}`);
        break;

      case "like_reply":
        // Goes to post + highlights reply (use commentId + replyId if needed)
        navigate(`/post/${n.postId}?comment=${n.commentId}&reply=${n.replyId}`);
        break;

      case "follow":
        navigate(`/profile/${n.fromUser._id}`);
        break;

      default:
        break;
    }

    setOpen(false);
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) markAsRead();
      }}
      popupRender={() => (
        <div style={{ width: 320, maxHeight: 420, overflowY: "auto" }}>
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onClick={handleClick}
          />
        </div>
      )}
    >
      <span>
        <Badge count={unreadCount} offset={[0, 6]}>
          <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>
      </span>
    </Dropdown>
  );
}
