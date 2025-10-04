import { useEffect, useState, useRef } from "react";
import { Avatar, Input, Button, List } from "antd";
import { UserOutlined, CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { useGetMessagesQuery, chatApi } from "../../redux/chat/chatApi";
import useChatSocket from "../../utils/useChatSocket";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MessageItem from "./MessageItem";

export default function ChatWindow({ conversation, onClose, offset = 0 }) {
  const currentUser = useSelector((s) => s.auth.user);
  const conversationId = conversation?._id;
  const dispatch = useDispatch();

  const { data: messages = [], isLoading } = useGetMessagesQuery(
    conversationId,
    { skip: !conversationId }
  );

  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { sendMessage, startTyping, stopTyping, markAsRead } = useChatSocket();

  const messagesEndRef = useRef(null);
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom(true);
  }, [messages]);

  useEffect(() => {
    const socket = window.chatSocket;
    const handleTyping = ({ userId, conversationId: cId }) => {
      if (cId === conversationId && userId !== currentUser._id)
        setIsTyping(true);
    };
    const handleStopTyping = ({ userId, conversationId: cId }) => {
      if (cId === conversationId && userId !== currentUser._id)
        setIsTyping(false);
    };
    socket?.on("typing", handleTyping);
    socket?.on("stop_typing", handleStopTyping);
    return () => {
      socket?.off("typing", handleTyping);
      socket?.off("stop_typing", handleStopTyping);
    };
  }, [conversationId, currentUser._id]);

  useEffect(() => {
    if (conversationId) markAsRead(conversationId);
  }, [conversationId, markAsRead]);

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
    stopTyping(conversationId);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) startTyping(conversationId);
    else stopTyping(conversationId);
  };

  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    ) || null;

  const lastMsg = messages[messages.length - 1];

  // Inline styles
  const baseWindowStyle = {
    position: "fixed",
    bottom: 0,
    right: 300 + offset,
    width: 280,
    height: minimized ? 48 : 380,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px 8px 0 0",
    boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    zIndex: 2100,
    transition: "all 0.25s ease",
    animation: "slideUp 0.25s ease",
  };

  // Override for mobile full-screen
  if (window.innerWidth < 768) {
    baseWindowStyle.right = 0;
    baseWindowStyle.left = 0;
    baseWindowStyle.width = "100%";
    baseWindowStyle.height = minimized ? 48 : "82vh";
  }

  const headerStyle = {
    height: 48,
    borderBottom: "1px solid #eee",
    padding: "0 8px",
    borderRadius: "8px 8px 0 0",
    boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 600,
    background: "#fff",
    cursor: "pointer",
  };

  const bodyStyle = {
    flex: 1,
    overflowY: "auto",
    padding: 8,
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  };

  const footerStyle = {
    borderTop: "1px solid #eee",
    padding: 6,
    display: "flex",
    gap: 6,
    alignItems: "center",
  };

  return (
    <div style={baseWindowStyle}>
      {/* Header */}
      <div style={headerStyle}>
        {otherUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to={`/profile/${otherUser._id}`}>
              <Avatar
                src={otherUser?.avatar || null}
                size="medium"
                icon={!otherUser?.avatar && <UserOutlined />}
              />
            </Link>
            <div>
              <Link
                to={`/profile/${otherUser._id}`}
                style={{
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                <span style={{ color: "#1677ff", fontWeight: 600 }}>
                  {otherUser.username}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 14, color: "#888" }}>Unknown user</span>
        )}

        <div style={{ display: "flex", gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => setMinimized(!minimized)}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div style={bodyStyle}>
            {isLoading && messages.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px" }}>Loading...</p>
            ) : (
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <MessageItem
                    key={msg._id}
                    msg={{
                      ...msg,
                      isMine:
                        msg.sender?._id?.toString() ===
                        currentUser._id?.toString(),
                    }}
                  />
                )}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Seen indicator */}
          {lastMsg && lastMsg.sender?._id === currentUser._id && (
            <div
              style={{
                textAlign: "right",
                fontSize: 12,
                color: "#888",
                marginRight: 8,
                marginTop: -6,
              }}
            >
              {lastMsg.readBy?.map(String).includes(otherUser?._id?.toString())
                ? "Seen"
                : "Delivered"}
            </div>
          )}

          {/* Footer */}
          <div style={footerStyle}>
            {isTyping && (
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                {otherUser?.username} is typing...
              </div>
            )}
            <Input.TextArea
              rows={2}
              value={input}
              onChange={handleInputChange}
              onBlur={() => stopTyping(conversationId)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleSend();
              }}
              placeholder="Write a message..."
            />
            <Button type="primary" onClick={handleSend}>
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
