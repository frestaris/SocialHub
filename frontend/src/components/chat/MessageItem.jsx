import {
  List,
  Avatar,
  Dropdown,
  Modal,
  Input,
  Button,
  Space,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
} from "../../redux/chat/chatApi";
import moment from "../../utils/momentShort";
import { useState } from "react";

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

  const EDIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
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
        {/* 🧱 If message deleted — render static bubble (no dropdown at all) */}
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
              cursor: "default",
              userSelect: "text",
            }}
          >
            <span>This message was deleted</span>
          </div>
        ) : (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: (
                    <Tooltip
                      title={
                        canStillEdit
                          ? ""
                          : msg.edited
                          ? "You’ve already edited this message"
                          : timeSince > EDIT_WINDOW_MS
                          ? "You can only edit messages within 2 minutes"
                          : "You can’t edit this message"
                      }
                      placement="left"
                    >
                      {/* wrapper span allows tooltip to fire even when inner div is disabled */}
                      <span style={{ display: "inline-block", width: "100%" }}>
                        <div
                          onClick={() => {
                            if (!canStillEdit) return;
                            setMenuOpen(false);
                            setIsEditing(true);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: canStillEdit ? 1 : 0.4,
                            cursor: canStillEdit ? "pointer" : "not-allowed",
                            // do NOT disable pointerEvents here — Tooltip needs it
                          }}
                        >
                          <EditOutlined /> Edit
                        </div>
                      </span>
                    </Tooltip>
                  ),
                },

                {
                  key: "delete",
                  label: (
                    <div
                      onClick={() => {
                        setMenuOpen(false);
                        handleDelete();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "red",
                      }}
                    >
                      <DeleteOutlined /> Delete
                    </div>
                  ),
                },
              ],
            }}
            trigger={["click", "contextMenu"]}
            open={!isEditing && menuOpen}
            onOpenChange={(visible) => {
              if (!isEditing) setMenuOpen(visible);
            }}
            disabled={!isMine}
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                background: isMine ? "#e6f0ff" : "#f5f5f5",
                color: "#000",
                padding: "6px 10px 4px 10px",
                borderRadius: 10,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                position: "relative",
                minHeight: 26,
                cursor: isMine ? "pointer" : "default",
                userSelect: "text",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (isMine) e.currentTarget.style.background = "#d9e8ff";
              }}
              onMouseLeave={(e) => {
                if (isMine) e.currentTarget.style.background = "#e6f0ff";
              }}
            >
              <span
                style={{
                  position: "absolute",
                  width: 0,
                  height: 0,
                  border: "8px solid transparent",
                  ...(isMine
                    ? {
                        bottom: 0,
                        right: -5,
                        borderLeftColor: "#e6f0ff",
                        borderRight: 0,
                        borderTop: 0,
                      }
                    : {
                        top: 0,
                        left: -5,
                        borderBottomColor: "#f5f5f5",
                        borderTop: 0,
                      }),
                }}
              />

              {/* 🟢 Editing Mode */}
              {isEditing ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onContextMenu={(e) => e.stopPropagation()}
                >
                  <Input.TextArea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ fontSize: 14 }}
                  />
                  <Space style={{ alignSelf: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setIsEditing(false);
                        setEditText(msg.content);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      disabled={editText.trim() === msg.content.trim()}
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                  </Space>
                </div>
              ) : (
                <>
                  <span style={{ lineHeight: 1.4 }}>
                    {msg.content}
                    {msg.edited && (
                      <span style={{ fontSize: 10, color: "#888" }}>
                        {" "}
                        (edited)
                      </span>
                    )}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 2,
                    }}
                  >
                    <small
                      style={{ color: "#8b8b8b", fontSize: 10, lineHeight: 1 }}
                    >
                      {moment(msg.createdAt).format("h:mm A")}
                    </small>

                    {isMine && (
                      <div
                        style={{
                          position: "relative",
                          width: 14,
                          height: 10,
                          display: "inline-block",
                        }}
                      >
                        {hasBeenSeen ? (
                          <>
                            <CheckOutlined
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                fontSize: 10,
                                color: "#34b7f1",
                                opacity: 0.9,
                              }}
                            />
                            <CheckOutlined
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 3,
                                fontSize: 10,
                                color: "#34b7f1",
                              }}
                            />
                          </>
                        ) : isDelivered ? (
                          <>
                            <CheckOutlined
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                fontSize: 10,
                                color: "#999",
                                opacity: 0.9,
                              }}
                            />
                            <CheckOutlined
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 3,
                                fontSize: 10,
                                color: "#999",
                              }}
                            />
                          </>
                        ) : (
                          <CheckOutlined
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 3,
                              fontSize: 10,
                              color: "#999",
                              opacity: 0.9,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Dropdown>
        )}
      </div>
    </List.Item>
  );
}
