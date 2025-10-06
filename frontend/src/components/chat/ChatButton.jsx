import { useEffect, useState } from "react";
import { Avatar, Button, Space, Tooltip, Badge, Dropdown } from "antd";
import {
  EditOutlined,
  DownOutlined,
  UpOutlined,
  MessageOutlined,
  UserOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/auth/authSlice";
import { chatSocketHelpers } from "../../utils/useChatSocket";

export default function ChatButton({
  user,
  onNewChat,
  onToggleList,
  openList,
  badgeCount = 0,
}) {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if screen is mobile (<768px)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dropdown menu
  const menuItems = [
    {
      key: "toggleStatus",
      label: (
        <span>
          {user?.showOnlineStatus ? "Appear Offline" : "Appear Online"}
        </span>
      ),
      onClick: async (e) => {
        e.domEvent.stopPropagation();
        const newStatus = !user?.showOnlineStatus;
        console.log("🟢 Toggling visibility via socket:", newStatus);

        // Optimistic UI update
        dispatch(setUser({ ...user, showOnlineStatus: newStatus }));

        // Notify backend via socket
        if (chatSocketHelpers && chatSocketHelpers.emit) {
          chatSocketHelpers.emit("toggle_visibility", newStatus);
        } else {
          console.warn("⚠️ Socket not connected yet.");
        }
      },
    },
  ];

  /**
   * --------------------------
   * MOBILE VERSION
   * --------------------------
   * - Floating circular button at bottom-right.
   * - Opens the chat drawer when tapped.
   */
  if (isMobile) {
    return (
      <Tooltip title="Messaging" placement="top">
        <Badge
          count={badgeCount}
          overflowCount={9}
          size="small"
          offset={[-4, 4]}
        >
          <div
            style={{
              position: "fixed",
              bottom: 80,
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
            }}
            onClick={onToggleList}
          >
            <MessageOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
        </Badge>
      </Tooltip>
    );
  }

  /**
   * --------------------------
   * DESKTOP VERSION
   * --------------------------
   * - Appears as a horizontal bar in the dock.
   * - Includes avatar, status indicator, unread badge, and controls.
   */
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

  return (
    <div
      style={buttonStyle}
      onClick={onToggleList}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = hoverStyle.background)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      {/* Left side */}
      <Space align="center" size={8}>
        <Badge
          count={badgeCount}
          overflowCount={9}
          size="small"
          offset={[-4, 4]}
        >
          <Tooltip
            title={
              user?.showOnlineStatus
                ? "You’re currently visible as online"
                : "You’re appearing offline"
            }
            placement="top"
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* User avatar */}
              <Avatar
                src={user?.avatar || null}
                icon={!user?.avatar && <UserOutlined />}
                size={32}
                style={{ cursor: "pointer" }}
              />

              {/* Online / Offline dot */}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: user?.showOnlineStatus ? "#4caf50" : "#9e9e9e",
                  border: "2px solid white",
                  boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                }}
              />
            </div>
          </Tooltip>
        </Badge>

        {/* Label */}
        <span style={{ fontWeight: 600, fontSize: 14 }}>Messaging</span>
      </Space>

      {/* Right side*/}
      <Space size={6}>
        {/* ⋯ Visibility dropdown */}
        <Dropdown
          menu={{ items: menuItems }}
          placement="topRight"
          arrow
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>

        {/* Start new chat */}
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onNewChat();
          }}
        />

        {/* Drawer toggle arrow */}
        <Button
          type="text"
          icon={openList ? <DownOutlined /> : <UpOutlined />}
        />
      </Space>
    </div>
  );
}
