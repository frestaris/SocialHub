import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import ChatButton from "./ChatButton";
import { Modal, List, message, Avatar, Drawer } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useStartConversationMutation } from "../../redux/chat/chatApi";

export default function ChatDock() {
  const user = useSelector((s) => s.auth.user);
  const [openList, setOpenList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState([]);
  const [maxWindows, setMaxWindows] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  const [startConversation] = useStartConversationMutation();

  // Responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setMaxWindows(1);
        setIsMobile(true);
      } else if (width < 1200) {
        setMaxWindows(2);
        setIsMobile(false);
      } else {
        setMaxWindows(3);
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Lock background scroll when a chat is open on mobile
  useEffect(() => {
    if (isMobile && chatWindows.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, chatWindows.length]);

  if (!user?._id) return null;

  const toggleList = () => setOpenList((prev) => !prev);

  const openChatWindow = (conv) => {
    if (!chatWindows.find((c) => c._id === conv._id)) {
      setChatWindows((prev) => [...prev, { ...conv }]);
      setOpenList(false);
    }
  };

  const closeChatWindow = (id) => {
    setChatWindows(chatWindows.filter((c) => c._id !== id));
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const res = await startConversation(targetUserId).unwrap();
      if (res.success) {
        openChatWindow({ ...res.conversation, initialMessages: res.messages });
        setIsModalOpen(false);
      } else {
        message.error(res.error || "Failed to start chat");
      }
    } catch (err) {
      message.error(err, "Could not start chat");
    }
  };

  const dockContainerStyle = {
    position: "fixed",
    bottom: 0,
    right: 24,
    width: 270,
    zIndex: 2000,
  };

  const chatPanelStyle = {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "all 0.25s ease",
    height: openList ? 450 : 48,
    display: "flex",
    flexDirection: "column",
  };

  const bodyStyle = {
    flex: 1,
    overflowY: "auto",
    background: "#fff",
  };

  const visibleWindows = chatWindows.slice(-maxWindows);

  return (
    <>
      {/* Desktop Dock Panel */}
      {!isMobile && (
        <div style={dockContainerStyle}>
          <div style={chatPanelStyle} className="chat-panel">
            <ChatButton
              user={user}
              onNewChat={() => setIsModalOpen(true)}
              onToggleList={toggleList}
              openList={openList}
            />
            <div style={bodyStyle}>
              <ChatList
                onSelectConversation={(conv) => openChatWindow(conv)}
                enabled={openList}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Button */}
      {isMobile && !chatWindows.length && (
        <ChatButton
          user={user}
          onNewChat={() => setIsModalOpen(true)}
          onToggleList={toggleList}
          openList={openList}
        />
      )}

      {/* Mobile Drawer for ChatList */}
      {isMobile && (
        <Drawer
          title="Messages"
          placement="bottom"
          height="60%"
          open={openList}
          onClose={() => setOpenList(false)}
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
            onSelectConversation={(conv) => openChatWindow(conv)}
            enabled={true}
          />
        </Drawer>
      )}

      {/* Modal: Start new chat */}
      <Modal
        title="People You Follow"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={400}
        styles={{
          body: { maxHeight: "60vh", overflowY: "auto", padding: "0 16px" },
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={user?.following || []}
          locale={{ emptyText: "You’re not following anyone yet" }}
          renderItem={(f) => (
            <List.Item
              key={f._id}
              onClick={() => handleStartChat(f._id)}
              style={{
                cursor: "pointer",
                borderRadius: 8,
                padding: "6px 10px",
                marginBottom: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={f.avatar || null}
                    icon={!f.avatar && <UserOutlined />}
                  />
                }
                title={<span style={{ color: "#1677ff" }}>{f.username}</span>}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Floating chat windows */}
      <div
        style={{
          position: "fixed",
          bottom: isMobile ? 0 : 0,
          right: isMobile ? 0 : 0,
          left: isMobile ? 0 : "auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row-reverse",
          justifyContent: isMobile ? "center" : "flex-start",
          gap: 8,
          paddingRight: isMobile ? 0 : 310,
        }}
      >
        {visibleWindows.map((conv, i) => (
          <ChatWindow
            key={conv._id}
            conversation={conv}
            offset={isMobile ? 0 : i * 300}
            onClose={() => closeChatWindow(conv._id)}
          />
        ))}
      </div>
    </>
  );
}
