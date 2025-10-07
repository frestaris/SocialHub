// src/components/chat/MessageItem/MessageItem.jsx
import { List, Avatar, Modal } from "antd";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
} from "../../../redux/chat/chatApi";
import { useState } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageItem({ msg }) {
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const isMine = msg.isMine;
  const otherUserId = msg.otherUserId;
  const hasBeenSeen = msg.readBy?.includes(otherUserId);
  const isDelivered =
    (!msg.pending && msg.readBy?.length === 1) ||
    (msg.readBy?.length > 1 && !hasBeenSeen);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const EDIT_WINDOW_MS = 2 * 60 * 1000;
  const createdAt = new Date(msg.createdAt).getTime();
  const timeSince = Date.now() - createdAt;
  const canStillEdit =
    isMine && !msg.deleted && !msg.edited && timeSince <= EDIT_WINDOW_MS;

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

  const handleSaveEdit = async () => {
    if (editText.trim() === msg.content.trim()) return;

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

    await editMessage({
      messageId: msg._id,
      conversationId: msg.conversationId,
      content: editText,
    });
    setIsEditing(false);
  };

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
      {!isMine && (
        <Avatar
          src={msg.sender?.avatar}
          icon={<UserOutlined />}
          size={28}
          style={{ flexShrink: 0 }}
        />
      )}

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
          />
        )}
      </div>
    </List.Item>
  );
}
