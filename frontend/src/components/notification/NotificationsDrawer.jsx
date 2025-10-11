import { Drawer, Badge, Button, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationsList from "./NotificationsList";
import useNotificationsFeed from "../../hooks/useNotificationsFeed";
import { useState } from "react";

export default function NotificationsDrawer({ onNavigate }) {
  const [open, setOpen] = useState(false);

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

  const handleNotificationClick = (n) => {
    handleClick(n);
    setOpen(false);
    onNavigate?.();
  };

  return (
    <>
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
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onClick={handleNotificationClick}
          />

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
