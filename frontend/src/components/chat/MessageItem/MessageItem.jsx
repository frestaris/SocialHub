// --- Ant Design ---
import { List, Avatar, Modal } from "antd";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

// --- Redux ---
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
} from "../../../redux/chat/chatApi";

// --- React ---
import { useState } from "react";

// --- Components ---
import MessageBubble from "./MessageBubble";

/**
 *
 * --------------------------------------
 * Renders a single message inside a conversation.
 *
 * Responsibilities:
 *  Displays text bubble, timestamp, and sender avatar
 *  Supports edit and delete (with confirmation)
 *  Handles message state (deleted / editable window)
 *  Integrates with MessageBubble for layout & UI
 *
 * Props:
 * - msg: message object
 * - searchTerm: string to highlight within message
 */
export default function MessageItem({ msg, searchTerm }) {
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();

  // --- Ownership & status logic ---
  const isMine = msg.isMine;
  const otherUserId = msg.otherUserId;

  // Seen/delivery states
  const hasBeenSeen = msg.readBy?.includes(otherUserId);
  const isDelivered =
    (!msg.pending && msg.readBy?.length === 1) ||
    (msg.readBy?.length > 1 && !hasBeenSeen);

  // --- Edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const [menuOpen, setMenuOpen] = useState(false);

  // Only allow editing within 2 minutes of sending
  const EDIT_WINDOW_MS = 2 * 60 * 1000;
  const createdAt = new Date(msg.createdAt).getTime();
  const timeSince = Date.now() - createdAt;
  const canStillEdit =
    isMine && !msg.deleted && !msg.edited && timeSince <= EDIT_WINDOW_MS;

  /**
   *  Delete message confirmation
   */
  const handleDelete = async () => {
    Modal.confirm({
      title: "Delete this message for everyone?",
      icon: <ExclamationCircleOutlined />,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        await deleteMessage({
          messageId: msg._id,
          conversationId: msg.conversationId,
        });
      },
    });
  };

  /**
   *  Save message edit or handle “empty = delete”
   */
  const handleSaveEdit = async () => {
    if (editText.trim() === msg.content.trim()) return;

    // If user clears message → confirm delete instead
    if (!editText.trim()) {
      Modal.confirm({
        title: "Delete this message?",
        icon: <ExclamationCircleOutlined />,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        centered: true,
        async onOk() {
          await deleteMessage({
            messageId: msg._id,
            conversationId: msg.conversationId,
          });
          setIsEditing(false);
        },
      });
      return;
    }

    // Otherwise edit content
    await editMessage({
      messageId: msg._id,
      conversationId: msg.conversationId,
      content: editText,
    });
    setIsEditing(false);
  };

  // --- Render ---
  return (
    <List.Item
      data-message-id={msg._id}
      style={{
        display: "flex",
        alignItems: "flex-end",
        padding: "6px 0",
        gap: 8,
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      {/*  Avatar (only for other user) */}
      {!isMine && (
        <Avatar
          src={msg.sender?.avatar}
          icon={<UserOutlined />}
          size={28}
          style={{ flexShrink: 0 }}
        />
      )}

      {/*  Message bubble or “deleted” notice */}
      <div style={{ maxWidth: "75%", position: "relative" }}>
        {msg.deleted ? (
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              background: "#f0f0f0",
              color: "#777",
              padding: "6px 10px 4px 10px",
              borderRadius: 10,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              minHeight: 26,
              fontStyle: "italic",
            }}
          >
            <span>This message was deleted</span>
          </div>
        ) : (
          <MessageBubble
            msg={msg}
            isMine={isMine}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editText={editText}
            setEditText={setEditText}
            handleSaveEdit={handleSaveEdit}
            handleDelete={handleDelete}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            canStillEdit={canStillEdit}
            timeSince={timeSince}
            EDIT_WINDOW_MS={EDIT_WINDOW_MS}
            hasBeenSeen={hasBeenSeen}
            isDelivered={isDelivered}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </List.Item>
  );
}
