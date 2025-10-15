// --- Ant Design ---
import { Avatar, Button, Space, Tooltip, Badge, Dropdown } from "antd";
import {
  EditOutlined,
  DownOutlined,
  UpOutlined,
  UserOutlined,
  MoreOutlined,
} from "@ant-design/icons";

// --- Redux ---
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/auth/authSlice";

// --- Utils ---
import { chatSocketHelpers } from "../../utils/sockets/useChatSocket";

/**
 *
 * --------------------------------------
 * The main dock control bar for chat (desktop view).
 *
 * Responsibilities:
 *  - Displays current user's avatar & status
 *  - Toggles online visibility (Appear Offline / Online)
 *  - Opens the new chat modal
 *  - Expands or collapses the chat list
 *
 * Props:
 *  - user: current logged-in user
 *  - onNewChat: opens start chat modal
 *  - onToggleList: toggles chat list visibility
 *  - openList: whether list is currently expanded
 *  - badgeCount: unread conversation count
 */
export default function ChatButton({
  user,
  onNewChat,
  onToggleList,
  openList,
  badgeCount = 0,
}) {
  const dispatch = useDispatch();

  /**
   * Dropdown Menu — toggle online visibility
   */
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

        // Optimistically update local state
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
   * --- Base styles ---
   * The button acts as a fixed dock bar (48px tall)
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
      {/* --- Left side: Avatar + Label --- */}
      <Space align="center" size={8}>
        {/* Badge for unread conversations */}
        <Badge
          count={badgeCount}
          overflowCount={9}
          size="small"
          offset={[-4, 4]}
        >
          {/* Avatar tooltip */}
          <Tooltip
            title={
              user?.showOnlineStatus
                ? "You’re currently visible as online"
                : "You’re appearing offline"
            }
            placement="top"
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Avatar */}
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

        <span style={{ fontWeight: 600, fontSize: 14 }}>Messaging</span>
      </Space>

      {/* --- Right side: Controls --- */}
      <Space size={6}>
        {/* Visibility dropdown */}
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
        <Tooltip title={"Start a new chat"} placement="top">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onNewChat();
            }}
          />
        </Tooltip>
        {/* toggle arrow */}
        <Button
          type="text"
          icon={openList ? <DownOutlined /> : <UpOutlined />}
        />
      </Space>
    </div>
  );
}
