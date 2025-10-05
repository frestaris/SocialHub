import { useEffect, useState, useRef } from "react";
import { Avatar, Input, Button, List } from "antd";
import { UserOutlined, CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { useGetMessagesQuery, chatApi } from "../../redux/chat/chatApi";
import { chatSocketHelpers } from "../../utils/useChatSocket";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MessageItem from "./MessageItem";
import { clearUnread, setActiveConversation } from "../../redux/chat/chatSlice";
import moment from "moment";

export default function ChatWindow({ conversation, onClose, offset = 0 }) {
  const currentUser = useSelector((s) => s.auth.user);
  const conversationId = conversation?._id;
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();

  const { data: messages = [], isLoading } = useGetMessagesQuery(
    conversationId,
    { skip: !conversationId }
  );

  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef(null);
  const [minimized, setMinimized] = useState(false);

  const { sendMessage, markAsRead, startTyping, stopTyping } =
    chatSocketHelpers;
  const typingUserId = useSelector((s) => s.chat.typing?.[conversationId]);
  const isTyping = typingUserId && typingUserId !== currentUser._id;

  const messagesEndRef = useRef(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentNode;
    // ✅ Scroll instantly on mount (no animation)
    if (messages.length > 0) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  // Maintain active conversation state
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

  // Mark as read when visible and messages exist
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

  // Typing style
  const dotStyle = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#9ca3af",
    animation: "typingBounce 1.4s infinite ease-in-out both",
  };

  useEffect(() => {
    // inject animation only once
    if (!document.getElementById("typingBounceKeyframes")) {
      const style = document.createElement("style");
      style.id = "typingBounceKeyframes";
      style.textContent = `
      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
        40% { transform: scale(1.0); opacity: 1; }
      }
    `;
      document.head.appendChild(style);
    }
  }, []);

  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== currentUser?._id?.toString()
    ) || null;

  // Inline styling
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
    zIndex: 2100,
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
      {/* Header */}
      <div
        onClick={() => setMinimized((prev) => !prev)}
        style={{
          height: 56,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fdfdfd",
          borderBottom: "1px solid #eee",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#fdfdfd")}
      >
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
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((prev) => !prev);
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 12px 48px",
              background: "#fafafa",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {isLoading && messages.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px" }}>Loading...</p>
            ) : (
              <List
                dataSource={messages}
                renderItem={(msg, index) => {
                  const prevMsg = messages[index - 1];
                  const currentDate = moment(msg.createdAt).format(
                    "YYYY-MM-DD"
                  );
                  const prevDate = prevMsg
                    ? moment(prevMsg.createdAt).format("YYYY-MM-DD")
                    : null;
                  const showDivider = currentDate !== prevDate;

                  return (
                    <>
                      {showDivider && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "12px 0",
                            color: "#888",
                            fontSize: 12,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#e0e0e0",
                            }}
                          />
                          <div
                            title={moment(msg.createdAt).format("MMMM D, YYYY")}
                            style={{
                              background: "#f5f5f5",
                              padding: "4px 12px",
                              borderRadius: 20,
                              margin: "0 10px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                              border: "1px solid #e0e0e0",
                              userSelect: "none",
                            }}
                          >
                            {(() => {
                              const date = moment(msg.createdAt);
                              if (date.isSame(moment(), "day")) return "Today";
                              if (
                                date.isSame(moment().subtract(1, "day"), "day")
                              )
                                return "Yesterday";
                              return date.format("dddd");
                            })()}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#e0e0e0",
                            }}
                          />
                        </div>
                      )}

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
                    </>
                  );
                }}
                split={false}
              />
            )}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  marginBottom: 4,
                }}
              >
                <Avatar
                  src={otherUser?.avatar || null}
                  size="small"
                  icon={!otherUser?.avatar && <UserOutlined />}
                />
                <div
                  style={{
                    background: "#f2f3f5",
                    borderRadius: "18px",
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={dotStyle}></div>
                  <div style={{ ...dotStyle, animationDelay: "0.2s" }}></div>
                  <div style={{ ...dotStyle, animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #eee",
              padding: "8px",
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "#fff",
            }}
          >
            <Input.TextArea
              rows={1}
              style={{
                borderRadius: 20,
                resize: "none",
                padding: "8px 12px",
                fontSize: 14,
              }}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                startTyping(conversationId);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  stopTyping(conversationId);
                }, 1500); // stop typing after 1.5s of inactivity
              }}
              onPressEnter={(e) => {
                e.preventDefault();
                handleSend();
                stopTyping(conversationId);
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
