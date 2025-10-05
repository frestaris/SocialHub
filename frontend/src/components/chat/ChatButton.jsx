import { useEffect, useState } from "react";
import { Avatar, Button, Space, Tooltip, Badge } from "antd";
import {
  EditOutlined,
  DownOutlined,
  UpOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function ChatButton({
  user,
  onNewChat,
  onToggleList,
  openList,
  badgeCount = 0,
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mobile floating button style
  const floatingStyle = {
    position: "fixed",
    bottom: 40,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#1677ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    zIndex: 2500,
    cursor: "pointer",
  };

  // Desktop bar style
  const buttonStyle = {
    height: 48,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    background: "#fff",
    transition: "background 0.2s",
  };

  const hoverStyle = { background: "#f7f9fa" };

  if (isMobile) {
    return (
      <Tooltip title="Messaging">
        <Badge count={badgeCount} size="small" offset={[-4, 4]}>
          <div style={floatingStyle} onClick={onToggleList}>
            <MessageOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
        </Badge>
      </Tooltip>
    );
  }

  // Default desktop layout
  return (
    <div
      style={buttonStyle}
      onClick={onToggleList}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = hoverStyle.background)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      <Space align="center" size={8}>
        <Badge count={badgeCount} size="small" offset={[2, 0]}>
          <Avatar
            src={user?.avatar || null}
            icon={!user?.avatar && <UserOutlined />}
            size={32}
            style={{ cursor: "pointer" }}
          />
        </Badge>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Messaging</span>
      </Space>

      <Space size={6}>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onNewChat();
          }}
        />
        <Button
          type="text"
          icon={openList ? <DownOutlined /> : <UpOutlined />}
        />
      </Space>
    </div>
  );
}
