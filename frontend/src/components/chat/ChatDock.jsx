import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow/ChatWindow";
import ChatButton from "./ChatButton";
import ChatDrawerMobile from "./ChatDrawerMobile";
import ChatModalStart from "./ChatModalStart";
import { useStartConversationMutation } from "../../redux/chat/chatApi";
import { chatSocketHelpers } from "../../utils/sockets/useChatSocket";
import { setActiveConversation } from "../../redux/chat/chatSlice";
import { handleError } from "../../utils/handleMessage";
import { useIncrementPostSharesMutation } from "../../redux/post/postApi";

export default function ChatDock() {
  const user = useSelector((s) => s.auth.user);
  const userStatus = useSelector((s) => s.chat.userStatus);
  const unreadCounts = useSelector((s) => s.chat.unread);
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();

  const totalUnread = Object.values(unreadCounts || {}).filter(
    (c) => c > 0
  ).length;
  const [openList, setOpenList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState([]);
  const [maxWindows, setMaxWindows] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [pendingSharePostId, setPendingSharePostId] = useState(null);
  const [incrementPostShares] = useIncrementPostSharesMutation();

  const [startConversation] = useStartConversationMutation();
  const { joinConversation } = chatSocketHelpers;

  useEffect(() => {
    const handleToggleChatList = () => setOpenList((prev) => !prev);
    window.addEventListener("toggleChatList", handleToggleChatList);
    return () =>
      window.removeEventListener("toggleChatList", handleToggleChatList);
  }, []);

  // responsive handling
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

  useEffect(() => {
    if (isMobile && chatWindows.some((w) => !w.minimized)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, chatWindows]);

  useEffect(() => {
    // Listen for global event from ProfileInfo
    const handleOpenFromProfile = (e) => {
      const conv = e.detail.conversation;
      if (!conv?._id) return;
      joinConversation(conv._id);
      openChatWindow(conv);
    };

    window.addEventListener("openChatFromProfile", handleOpenFromProfile);
    return () =>
      window.removeEventListener("openChatFromProfile", handleOpenFromProfile);
  }, [joinConversation]);

  useEffect(() => {
    const handleSharePost = (e) => {
      const { postId } = e.detail;
      setIsModalOpen(true);
      setPendingSharePostId(postId);
    };
    window.addEventListener("sharePostToChat", handleSharePost);
    return () => window.removeEventListener("sharePostToChat", handleSharePost);
  }, []);
  useEffect(() => {
    const handleCloseAllChats = () => {
      // Close or minimize all chat windows
      setChatWindows((prev) => prev.map((c) => ({ ...c, minimized: true })));
      setOpenList(false);
    };

    window.addEventListener("closeAllChats", handleCloseAllChats);
    return () =>
      window.removeEventListener("closeAllChats", handleCloseAllChats);
  }, []);

  if (!user?._id) return null;

  const toggleList = () => setOpenList((prev) => !prev);

  const openChatWindow = (conv) => {
    setChatWindows((prev) => {
      // If chat already open, just un-minimize it
      const existing = prev.find((c) => c._id === conv._id);
      if (existing) {
        return prev.map((c) =>
          c._id === conv._id ? { ...c, minimized: false } : c
        );
      }

      // Add new chat window at the end
      const updated = [...prev, { ...conv }];

      // If exceeding max windows, close (remove) the oldest one
      if (updated.length > maxWindows) {
        updated.shift();
      }

      return updated;
    });

    setOpenList(false);
    dispatch(setActiveConversation(conv._id));
  };

  const closeChatWindow = (id) => {
    setChatWindows(chatWindows.filter((c) => c._id !== id));
    if (activeConversationId === id) dispatch(setActiveConversation(null));
  };

  const handleStartChat = async (targetUserId) => {
    try {
      const res = await startConversation(targetUserId).unwrap();
      if (res.success && res.conversation?._id) {
        joinConversation(res.conversation._id);
        openChatWindow({
          ...res.conversation,
          initialMessages: res.messages,
        });
        setIsModalOpen(false);

        // Automatically send post link if sharing
        if (pendingSharePostId) {
          const postUrl = `${window.location.origin}/post/${pendingSharePostId}`;
          setTimeout(() => {
            chatSocketHelpers.sendMessage(res.conversation._id, postUrl);
          }, 600);

          // increment share count in DB and cache
          incrementPostShares(pendingSharePostId)
            .unwrap()
            .catch((err) => console.error("❌ Share count failed:", err));

          setPendingSharePostId(null);
        }
      } else {
        handleError(res.error || "Failed to start chat");
      }
    } catch (err) {
      handleError(err?.data?.error || "Something went wrong");
    }
  };

  const visibleWindows = chatWindows.slice(-maxWindows);

  return (
    <>
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 24,
            width: 270,
            zIndex: 200,
          }}
        >
          <div
            style={{
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
            }}
          >
            <ChatButton
              key={totalUnread}
              user={user}
              onNewChat={() => setIsModalOpen(true)}
              onToggleList={toggleList}
              openList={openList}
              badgeCount={totalUnread}
            />
            <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
              <ChatList
                onSelectConversation={openChatWindow}
                enabled={openList}
                userStatus={userStatus}
              />
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <ChatDrawerMobile
          open={openList}
          onClose={() => setOpenList(false)}
          user={user}
          userStatus={userStatus}
          dispatch={dispatch}
          setIsModalOpen={setIsModalOpen}
          onSelectConversation={openChatWindow}
        />
      )}

      <ChatModalStart
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        following={user?.following}
        onStartChat={handleStartChat}
        pendingSharePostId={pendingSharePostId}
      />

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
            offset={isMobile ? 0 : i * 330}
            onClose={() => closeChatWindow(conv._id)}
            onToggleMinimize={(isMin) =>
              setChatWindows((prev) =>
                prev.map((c) =>
                  c._id === conv._id ? { ...c, minimized: isMin } : c
                )
              )
            }
            userStatus={userStatus}
            minimized={conv.minimized}
          />
        ))}
      </div>
    </>
  );
}
