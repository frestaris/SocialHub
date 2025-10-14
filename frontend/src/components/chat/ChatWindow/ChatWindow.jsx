// --- React ---
import { useEffect, useState, useRef } from "react";

// --- Redux ---
import { useSelector, useDispatch } from "react-redux";
import {
  clearUnread,
  setActiveConversation,
} from "../../../redux/chat/chatSlice";

// --- API Hooks ---
import {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} from "../../../redux/chat/chatApi";

// --- Components ---
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import ChatWindowFooter from "./ChatWindowFooter";

// --- Utils ---
import { chatSocketHelpers } from "../../../utils/sockets/useChatSocket";
import { Spin } from "antd";

/**
 *
 * --------------------------------------
 * Represents one open chat window.
 *
 * Responsibilities:
 *  Fetch messages (initial + infinite scroll)
 *  Handle optimistic message sending
 *  Handle mark-as-read logic
 *  Manage typing indicators
 *  Integrate search filter (via header search)
 */
export default function ChatWindow({
  conversation,
  onClose,
  offset = 0,
  userStatus,
  minimized,
  onToggleMinimize,
}) {
  // --- Redux state ---
  const currentUser = useSelector((s) => s.auth.user);
  const unreadCounts = useSelector((s) => s.chat.unread);
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();

  const conversationId = conversation?._id;

  // --- Socket helpers ---
  const { sendMessage, markAsRead, startTyping, stopTyping } =
    chatSocketHelpers;

  // --- Local state ---
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Refs ---
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Typing indicator logic ---
  const typingUserId = useSelector((s) => s.chat.typing?.[conversationId]);
  const isTyping = typingUserId && typingUserId !== currentUser._id;

  // --- Initial fetch (latest 20 messages) ---
  const { data, isFetching } = useGetMessagesQuery(
    { conversationId, limit: 20 },
    { skip: !conversationId }
  );

  // --- Lazy query for older messages ---
  const [loadOlderMessages] = useLazyGetMessagesQuery();

  /**
   * Initialize messages on load
   */
  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
      setHasMore(data.hasMore);
    }
  }, [data]);

  /**
   * Infinite scroll for older messages
   */
  const handleScroll = async () => {
    const container = scrollContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    // When near top, fetch older
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

          // Maintain scroll position after prepend
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevHeight + 60;
          });
        }
      } finally {
        setLoadingMore(false);
      }
    }
  };

  /**
   * Apply search filter (live)
   */
  const filteredMessages = searchTerm
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  /**
   * Mark as read when window opened
   */
  useEffect(() => {
    if (!conversationId) return;
    if (!minimized && messages.length > 0) {
      markAsRead(conversationId);
      dispatch(clearUnread(conversationId));
    }
  }, [conversationId, minimized, messages.length, dispatch, markAsRead]);

  /**
   * Manage active conversation tracking
   */
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

  /**
   * Auto-scroll to bottom on new messages
   */
  useEffect(() => {
    if (!scrollContainerRef.current || minimized) return;
    const container = scrollContainerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [messages.length, minimized]);

  /**
   * Send message (optimistic UI)
   */
  const handleSend = () => {
    if (!input.trim()) return;

    // Create optimistic temporary message
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

  /**
   * Determine the other participant
   */
  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    ) || null;

  // --- Base window style (desktop + responsive) ---
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

  // Mobile overrides
  if (window.innerWidth < 768) {
    baseWindowStyle.right = 0;
    baseWindowStyle.left = 0;
    baseWindowStyle.width = "100%";
    baseWindowStyle.height = minimized ? 48 : "82vh";
  }

  // --- Render ---
  return (
    <div style={baseWindowStyle}>
      {/* HEADER */}
      <ChatWindowHeader
        otherUser={otherUser}
        unreadCount={unreadCounts?.[conversationId]}
        userStatus={userStatus}
        onToggleMinimize={onToggleMinimize}
        minimized={minimized}
        onClose={onClose}
        onSearch={setSearchTerm}
      />

      {/* BODY + FOOTER (only visible when not minimized) */}
      {!minimized && (
        <>
          {/* Message list */}
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
            {/* Spinner for loading older messages */}
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

          {/* Input box */}
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
