import { useEffect, useState, useRef } from "react";
import { useGetMessagesQuery, chatApi } from "../../redux/chat/chatApi";
import { chatSocketHelpers } from "../../utils/useChatSocket";
import { useSelector, useDispatch } from "react-redux";
import { clearUnread, setActiveConversation } from "../../redux/chat/chatSlice";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import ChatWindowFooter from "./ChatWindowFooter";

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

  const { data: messages = [], isLoading } = useGetMessagesQuery(
    conversationId,
    { skip: !conversationId }
  );

  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef(null);
  const { sendMessage, markAsRead, startTyping, stopTyping } =
    chatSocketHelpers;
  const typingUserId = useSelector((s) => s.chat.typing?.[conversationId]);
  const isTyping = typingUserId && typingUserId !== currentUser._id;
  const messagesEndRef = useRef(null);

  // Scroll to bottom on update
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentNode;
    if (messages.length > 0) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

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

  useEffect(() => {
    if (!conversationId) return;
    if (!minimized && messages.length > 0) {
      markAsRead(conversationId);
      dispatch(clearUnread(conversationId));
    }
  }, [conversationId, minimized, messages.length, dispatch, markAsRead]);

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

    dispatch(
      chatApi.util.updateQueryData("getMessages", conversationId, (draft) => {
        draft.push(optimisticMsg);
      })
    );

    sendMessage(conversationId, input);
    setInput("");
  };

  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    ) || null;

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
      />
      {!minimized && (
        <>
          <ChatWindowBody
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            otherUser={otherUser}
            currentUser={currentUser}
            messagesEndRef={messagesEndRef}
          />
          <ChatWindowFooter
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            startTyping={startTyping}
            stopTyping={stopTyping}
            conversationId={conversationId}
            typingTimeoutRef={typingTimeoutRef}
          />
        </>
      )}
    </div>
  );
}
