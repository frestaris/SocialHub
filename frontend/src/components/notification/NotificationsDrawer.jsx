import { Drawer, Badge, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useGetNotificationsQuery } from "../../redux/notification/notificationApi";
import NotificationsList from "./NotificationsList";

export default function NotificationsDrawer() {
  const { data, isLoading } = useGetNotificationsQuery();
  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        block
        icon={
          <Badge count={unreadCount} size="small">
            <BellOutlined />
          </Badge>
        }
        onClick={() => setOpen(true)}
      >
        Notifications
      </Button>

      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <NotificationsList
          notifications={notifications}
          isLoading={isLoading}
          onClick={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
