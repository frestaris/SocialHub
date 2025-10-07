import { Input, Button } from "antd";

export default function ChatWindowFooter({
  input,
  setInput,
  handleSend,
  startTyping,
  stopTyping,
  conversationId,
  typingTimeoutRef,
}) {
  return (
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
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
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
      <Button type="primary" shape="round" onClick={handleSend}>
        Send
      </Button>
    </div>
  );
}
