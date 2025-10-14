// --- Ant Design ---
import { List, Avatar, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";

// --- Time library ---
import moment from "moment";

// --- Components ---
import MessageItem from "../MessageItem/MessageItem";

/**
 *
 * --------------------------------------
 * Displays all chat messages inside a conversation.
 *
 * Responsibilities:
 *  Render messages with date dividers
 *  Handle “is typing…” bubble
 *  Show empty or loading states
 *
 * Props:
 * - messages: array of message objects
 * - isLoading: bool (true while messages load)
 * - isTyping: bool (true if other user typing)
 * - otherUser: user object (for avatar)
 * - currentUser: user object
 * - messagesEndRef: scroll anchor
 * - searchTerm: highlights matching terms (passed to MessageItem)
 */
export default function ChatWindowBody({
  messages,
  isLoading,
  isTyping,
  otherUser,
  currentUser,
  messagesEndRef,
  searchTerm,
}) {
  // Typing animation dot style
  const dotStyle = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#9ca3af",
    animation: "typingBounce 1.4s infinite ease-in-out both",
  };

  return (
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
      {/* Loading state */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="medium" />
        </div>
      ) : messages.length === 0 ? (
        /*  Empty chat state */
        <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
          Say hello...
        </div>
      ) : (
        /*  Messages list */
        <List
          dataSource={messages}
          renderItem={(msg, index) => {
            const prevMsg = messages[index - 1];
            const currentDate = moment(msg.createdAt).format("YYYY-MM-DD");
            const prevDate = prevMsg
              ? moment(prevMsg.createdAt).format("YYYY-MM-DD")
              : null;
            const showDivider = currentDate !== prevDate;

            return (
              <>
                {/*  Date divider (Today / Yesterday / Day name) */}
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
                      style={{ flex: 1, height: 1, background: "#e0e0e0" }}
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
                        if (date.isSame(moment().subtract(1, "day"), "day"))
                          return "Yesterday";
                        return date.format("dddd");
                      })()}
                    </div>
                    <div
                      style={{ flex: 1, height: 1, background: "#e0e0e0" }}
                    />
                  </div>
                )}

                {/* Individual message */}
                <MessageItem
                  key={msg._id}
                  msg={{
                    ...msg,
                    isMine:
                      msg.sender?._id?.toString() ===
                      currentUser._id?.toString(),
                    otherUserId: otherUser?._id,
                  }}
                  searchTerm={searchTerm}
                />
              </>
            );
          }}
          split={false}
        />
      )}

      {/* Typing indicator bubble */}
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

      {/* Bottom anchor for auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
}
