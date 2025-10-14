// --- React ---
import { useEffect, useRef, useState } from "react";

// --- Ant Design ---
import { Input, Button } from "antd";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";

// --- Emoji Picker ---
import EmojiPicker from "emoji-picker-react";

/**
 *
 * --------------------------------------
 * The bottom input area of the chat window.
 *
 * Responsibilities:
 *  Handles message input and sending
 *  Emits typing events
 *  Integrates emoji picker
 *
 * Props:
 * - input: message string
 * - setInput: state setter
 * - handleSend: fn() to send message
 * - startTyping: fn(conversationId)
 * - stopTyping: fn(conversationId)
 * - conversationId: current chat id
 * - typingTimeoutRef: ref to debounce typing events
 * - autoFocus: focus input on mount (bool)
 */
export default function ChatWindowFooter({
  input,
  setInput,
  handleSend,
  startTyping,
  stopTyping,
  conversationId,
  typingTimeoutRef,
  autoFocus = false,
}) {
  const inputRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Autofocus input when chat opens
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus({ cursor: "end" });
    }
  }, [autoFocus]);

  //  Handle emoji insert
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setInput((prev) => prev + emoji);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        padding: 8,
        borderTop: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#fff",
      }}
    >
      {/*  Emoji picker toggle */}
      <div style={{ position: "relative" }}>
        <Button
          type="text"
          icon={<SmileOutlined style={{ fontSize: 20, color: "#888" }} />}
          onClick={(e) => {
            e.stopPropagation();
            setEmojiOpen((prev) => !prev);
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />

        {/* Popup emoji picker */}
        {emojiOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: "48px",
              left: 0,
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 8,
              padding: 8,
              zIndex: 1000,
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={320}
              searchDisabled={true}
              skinTonesDisabled={true}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

      {/* Text input */}
      <Input.TextArea
        ref={inputRef}
        rows={1}
        style={{
          flex: 1,
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
          }, 1500);
        }}
        onPressEnter={(e) => {
          e.preventDefault();
          handleSend();
          stopTyping(conversationId);
        }}
        placeholder="Write a message..."
      />

      {/* Send button */}
      <Button
        type="text"
        icon={
          <SendOutlined
            style={{
              fontSize: 18,
              color: input.trim() ? "#1677ff" : "#bbb",
              transform: "rotate(-15deg)",
            }}
          />
        }
        disabled={!input.trim()}
        onClick={() => {
          handleSend();
          stopTyping(conversationId);
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
