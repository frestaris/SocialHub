import { Dropdown, Badge, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationsList from "./NotificationsList";
import useNotificationsFeed from "../../hooks/useNotificationsFeed";
import { useState } from "react";

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
        if (next) markAsRead();
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
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onClick={(n) => {
              handleClick(n);
              setOpen(false);
            }}
          />

          {(isFetching || loadingMore) && (
            <div style={{ textAlign: "center", padding: 8 }}>
              <Spin size="small" />
            </div>
          )}
        </div>
      )}
    >
      <span>
        <Badge
          count={unreadCount}
          overflowCount={9}
          offset={[0, 6]}
          style={{ backgroundColor: "#1677ff" }}
        >
          <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>
      </span>
    </Dropdown>
  );
}
