import { useEffect, useState, useRef } from "react";
import {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} from "../../../redux/chat/chatApi";
import { chatSocketHelpers } from "../../../utils/useChatSocket";
import { useSelector, useDispatch } from "react-redux";
import {
  clearUnread,
  setActiveConversation,
} from "../../../redux/chat/chatSlice";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import ChatWindowFooter from "./ChatWindowFooter";
import { Spin } from "antd";

export default function ChatWindow({
  conversation,
  onClose,
  offset = 0,
  userStatus,
  minimized,
  onToggleMinimize,
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const conversationId = conversation?._id;
  const unreadCounts = useSelector((s) => s.chat.unread);
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();

  // --- Chat socket helpers ---
  const { sendMessage, markAsRead, startTyping, stopTyping } =
    chatSocketHelpers;

  // --- Local state ---
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Typing indicator ---
  const typingUserId = useSelector((s) => s.chat.typing?.[conversationId]);
  const isTyping = typingUserId && typingUserId !== currentUser._id;

  // --- Initial load (latest 20 messages) ---
  const { data, isFetching } = useGetMessagesQuery(
    { conversationId, limit: 20 },
    { skip: !conversationId }
  );

  // --- Lazy fetch for older messages ---
  const [loadOlderMessages] = useLazyGetMessagesQuery();

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
      setHasMore(data.hasMore);
    }
  }, [data]);

  // --- Infinite scroll: load older messages when near top ---
  const handleScroll = async () => {
    const container = scrollContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop < 100) {
      setLoadingMore(true);
      const oldestMsgId = messages[0]?._id;

      try {
        const { data: older } = await loadOlderMessages({
          conversationId,
          before: oldestMsgId,
          limit: 20,
        });

        if (older?.messages?.length) {
          const prevHeight = container.scrollHeight;
          setMessages((prev) => [...older.messages, ...prev]);
          setHasMore(older.hasMore);

          // Keep scroll position stable
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevHeight + 60;
          });
        }
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // --- Filter messages by search term ---
  const filteredMessages = searchTerm
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  // --- Mark as read when opened ---
  useEffect(() => {
    if (!conversationId) return;
    if (!minimized && messages.length > 0) {
      markAsRead(conversationId);
      dispatch(clearUnread(conversationId));
    }
  }, [conversationId, minimized, messages.length, dispatch, markAsRead]);

  // --- Track active conversation ---
  useEffect(() => {
    if (!conversationId) return;
    if (!minimized) {
      dispatch(setActiveConversation(conversationId));
    } else if (activeConversationId === conversationId) {
      dispatch(setActiveConversation(null));
    }
    return () => {
      if (activeConversationId === conversationId) {
        dispatch(setActiveConversation(null));
      }
    };
  }, [conversationId, minimized, dispatch, activeConversationId]);

  // --- Scroll to bottom when new messages arrive (from socket) ---
  useEffect(() => {
    if (!scrollContainerRef.current || minimized) return;
    const container = scrollContainerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [messages.length, minimized]);

  // --- Send message (optimistic UI) ---
  const handleSend = () => {
    if (!input.trim()) return;
    const optimisticMsg = {
      _id: Date.now().toString(),
      conversationId,
      sender: currentUser,
      content: input,
      readBy: [currentUser._id],
      pending: true,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    sendMessage(conversationId, input);
    setInput("");
  };

  // --- Other participant ---
  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    ) || null;

  // --- Styles ---
  const baseWindowStyle = {
    position: "fixed",
    bottom: 0,
    right: 300 + offset,
    width: 320,
    height: minimized ? 48 : 420,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px 12px 0 0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    zIndex: 200,
    transition: "all 0.25s ease",
    animation: "slideUp 0.25s ease",
    overflow: "hidden",
  };

  if (window.innerWidth < 768) {
    baseWindowStyle.right = 0;
    baseWindowStyle.left = 0;
    baseWindowStyle.width = "100%";
    baseWindowStyle.height = minimized ? 48 : "82vh";
  }

  return (
    <div style={baseWindowStyle}>
      <ChatWindowHeader
        otherUser={otherUser}
        unreadCount={unreadCounts?.[conversationId]}
        userStatus={userStatus}
        onToggleMinimize={onToggleMinimize}
        minimized={minimized}
        onClose={onClose}
        onSearch={setSearchTerm}
      />

      {!minimized && (
        <>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#fafafa",
              position: "relative",
            }}
          >
            {/* Show loading spinner when fetching older messages */}
            {loadingMore && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 0",
                  color: "#888",
                }}
              >
                <Spin size="small" style={{ marginRight: 8 }} />
              </div>
            )}

            <ChatWindowBody
              isLoading={isFetching}
              isTyping={isTyping}
              otherUser={otherUser}
              currentUser={currentUser}
              messagesEndRef={messagesEndRef}
              messages={filteredMessages}
              searchTerm={searchTerm}
            />
          </div>

          <ChatWindowFooter
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            startTyping={startTyping}
            stopTyping={stopTyping}
            conversationId={conversationId}
            typingTimeoutRef={typingTimeoutRef}
            autoFocus
          />
        </>
      )}
    </div>
  );
}
