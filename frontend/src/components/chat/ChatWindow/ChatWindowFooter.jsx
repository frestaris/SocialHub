import { useEffect, useRef, useState } from "react";
import { Input, Button, Popover } from "antd";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";

export default function ChatWindowFooter({ ...props }) {
  const {
    input,
    setInput,
    handleSend,
    startTyping,
    stopTyping,
    conversationId,
    typingTimeoutRef,
    autoFocus = false,
  } = props;

  const inputRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus({ cursor: "end" });
    }
  }, [autoFocus]);

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
      {/* Emoji Button */}
      <Popover
        getPopupContainer={() => document.body}
        open={emojiOpen}
        onOpenChange={(open) => setEmojiOpen(open)}
        placement="topLeft"
        content={
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 320, overflowY: "auto" }}
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        }
      >
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
      </Popover>

      {/* Input */}
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

      {/* Send Button */}
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
