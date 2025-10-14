import { Drawer, Badge, Button, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationsList from "./NotificationsList";
import useNotificationsFeed from "../../hooks/useNotificationsFeed";
import { useState } from "react";

/**
 *
 * --------------------------------------
 * Displays a full-height notifications drawer for mobile devices.
 *
 * Responsibilities:
 *  Fetch and display user notifications
 *  Handles scroll-based pagination
 *  Marks notifications as read on open
 *  Navigates or closes drawer when an item is clicked
 *
 * Props:
 * - onNavigate (optional): callback fired when a notification leads to navigation
 */
export default function NotificationsDrawer({ onNavigate }) {
  const [open, setOpen] = useState(false);

  // Hook for fetching + pagination
  const {
    notifications,
    unreadCount,
    listRef,
    isLoading,
    loadingMore,
    handleScroll,
    handleClick,
    markAsRead,
  } = useNotificationsFeed({ limit: 15, active: open });

  //  Handle notification click → navigate & close
  const handleNotificationClick = (n) => {
    handleClick(n);
    setOpen(false);
    onNavigate?.();
  };

  return (
    <>
      {/*  Button trigger (with badge) */}
      <Button
        type="text"
        icon={
          <Badge count={unreadCount} overflowCount={9} size="small">
            <BellOutlined style={{ fontSize: 20 }} />
          </Badge>
        }
        onClick={() => {
          setOpen(true);
          markAsRead();
        }}
      />

      {/*  Right-side drawer */}
      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            background: "#fafafa",
          }}
        >
          {/*  Notifications list */}
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onClick={handleNotificationClick}
          />

          {/*  Infinite scroll loader */}
          {loadingMore && !isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "12px 0",
              }}
            >
              <Spin size="default" />
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
