import { Dropdown, Badge, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationsList from "./NotificationsList";
import useNotificationsFeed from "../../hooks/useNotificationsFeed";
import { useState } from "react";

/**
 *
 * --------------------------------------
 * Displays a compact notifications feed as a dropdown (for desktop).
 *
 * Responsibilities:
 *  Fetches and displays latest notifications
 *  Handles infinite scroll & mark-as-read logic
 *  Updates unread badge dynamically
 *  Closes dropdown when a notification is clicked
 */
export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    listRef,
    isLoading,
    isFetching,
    loadingMore,
    handleScroll,
    handleClick,
    markAsRead,
  } = useNotificationsFeed({ limit: 10, active: open });

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) markAsRead(); // mark all as read when opened
      }}
      popupRender={() => (
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {/*  Notifications list */}
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onClick={(n) => {
              handleClick(n);
              setOpen(false);
            }}
          />

          {/*  Loading spinner (fetching more) */}
          {(isFetching || loadingMore) && (
            <div style={{ textAlign: "center", padding: 8 }}>
              <Spin size="small" />
            </div>
          )}
        </div>
      )}
    >
      {/* Bell icon with unread badge */}
      <span>
        <Badge
          count={unreadCount}
          overflowCount={9}
          offset={[-4, 4]}
          size="small"
        >
          <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>
      </span>
    </Dropdown>
  );
}
