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
  const lastSeenMessageRef = useRef(null);

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
    if (!conversationId || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // Only mark if there's a new message we haven't seen yet
    if (lastMsg && lastMsg._id !== lastSeenMessageRef.current) {
      markAsRead(conversationId);
      lastSeenMessageRef.current = lastMsg._id;
    }
  }, [conversationId, messages, markAsRead]);

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

  // Inline styles
  const baseWindowStyle = {
    position: "fixed",
    bottom: 0,
    right: 300 + offset,
    width: 320,
    height: minimized ? 48 : 420,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px 12px 0 0", // more modern rounded corners
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // deeper shadow
    display: "flex",
    flexDirection: "column",
    zIndex: 2100,
    transition: "all 0.25s ease",
    animation: "slideUp 0.25s ease",
    overflow: "hidden",
  };

  // Mobile override
  if (window.innerWidth < 768) {
    baseWindowStyle.right = 0;
    baseWindowStyle.left = 0;
    baseWindowStyle.width = "100%";
    baseWindowStyle.height = minimized ? 48 : "85vh";
  }

  const headerStyle = {
    height: 56,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fdfdfd",
    borderBottom: "1px solid #eee",
    borderRadius: "12px 12px 0 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  const bodyStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "12px 12px 0",
    background: "#fafafa", // subtle background for contrast
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  const footerStyle = {
    borderTop: "1px solid #eee",
    padding: "8px",
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "#fff",
  };

  // Better textarea styling
  const inputStyle = {
    borderRadius: 20,
    resize: "none",
    padding: "8px 12px",
    fontSize: 14,
  };
  useEffect(() => {
    if (conversationId && window.chatSocket) {
      window.chatSocket.emit("join_conversations", [conversationId]);
    }
  }, [conversationId]);

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
                      otherUserId: otherUser?._id,
                    }}
                  />
                )}
                split={false}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            {isTyping && (
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                {otherUser?.username} is typing...
              </div>
            )}
            <Input.TextArea
              rows={1}
              style={inputStyle}
              value={input}
              onChange={handleInputChange}
              onBlur={() => stopTyping(conversationId)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleSend();
              }}
              placeholder="Write a message..."
            />
            <Button type="primary" shape="round" onClick={handleSend}>
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
