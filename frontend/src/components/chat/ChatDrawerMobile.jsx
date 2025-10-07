import { Drawer, Avatar, Button, Dropdown } from "antd";
import { PlusOutlined, UserOutlined, MoreOutlined } from "@ant-design/icons";
import ChatList from "./ChatList";
import { setUser } from "../../redux/auth/authSlice";
import { chatSocketHelpers } from "../../utils/useChatSocket";

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Avatar
                src={user?.avatar || null}
                icon={!user?.avatar && <UserOutlined />}
                size={36}
              />
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

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                      dispatch(
                        setUser({ ...user, showOnlineStatus: newStatus })
                      );
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
      <ChatList
        onSelectConversation={onSelectConversation}
        enabled={true}
        userStatus={userStatus}
      />
    </Drawer>
  );
}
