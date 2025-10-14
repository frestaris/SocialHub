// --- Ant Design ---
import { Drawer, Avatar, Button, Dropdown } from "antd";
import { PlusOutlined, UserOutlined, MoreOutlined } from "@ant-design/icons";

// --- Local Imports ---
import ChatList from "./ChatList";
import { setUser } from "../../redux/auth/authSlice";
import { chatSocketHelpers } from "../../utils/sockets/useChatSocket";

/**
 *
 * --------------------------------------
 * Mobile-only chat drawer that slides up from the bottom.
 * Used when screen width < 768px (controlled in ChatDock).
 *
 * Features:
 *  - Displays the user's avatar and online status
 *  - Toggles visibility (Appear online / offline)
 *  - Opens ChatList inside the drawer
 *  - Allows starting a new conversation via "+" button
 */
export default function ChatDrawerMobile({
  open,
  onClose,
  user,
  userStatus,
  dispatch,
  setIsModalOpen,
  onSelectConversation,
}) {
  return (
    <Drawer
      title={
        // Custom header layout inside drawer
        <div
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {/* --- Left side: Avatar + Title --- */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Avatar
                src={user?.avatar || null}
                icon={!user?.avatar && <UserOutlined />}
                size={36}
              />
              {/* Online status indicator */}
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
                }}
              />
            </div>

            <span style={{ fontWeight: 600, fontSize: 16 }}>Messages</span>
          </div>

          {/* --- Right side: ⋯ menu + + new chat --- */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Visibility toggle dropdown */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "toggleStatus",
                    label: (
                      <span>
                        {user?.showOnlineStatus
                          ? "Appear Offline"
                          : "Appear Online"}
                      </span>
                    ),
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      const newStatus = !user?.showOnlineStatus;

                      // Update local Redux user state
                      dispatch(
                        setUser({ ...user, showOnlineStatus: newStatus })
                      );

                      // Sync to backend via Socket.IO
                      if (chatSocketHelpers?.emit) {
                        chatSocketHelpers.emit("toggle_visibility", newStatus);
                      }
                    },
                  },
                ],
              }}
              placement="bottomRight"
              trigger={["click"]}
              arrow
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#1677ff", fontSize: 20 }}
              />
            </Dropdown>

            {/* Start new chat */}
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{ color: "#1677ff", fontSize: 20 }}
            />
          </div>
        </div>
      }
      placement="bottom"
      height="60%"
      open={open}
      onClose={onClose}
      styles={{
        body: { padding: 0 },
        content: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
          overflowX: "hidden",
        },
      }}
    >
      {/* Conversation list inside drawer */}
      <ChatList
        onSelectConversation={onSelectConversation}
        enabled={true}
        userStatus={userStatus}
      />
    </Drawer>
  );
}
