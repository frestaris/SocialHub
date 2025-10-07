import { List, Avatar, Dropdown, Modal } from "antd";
import {
  UserOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useDeleteMessageMutation } from "../../redux/chat/chatApi";
import moment from "../../utils/momentShort";

export default function MessageItem({ msg }) {
  const [deleteMessage] = useDeleteMessageMutation();
  const isMine = msg.isMine;
  const otherUserId = msg.otherUserId;
  const hasBeenSeen = msg.readBy?.includes(otherUserId);
  const isDelivered =
    (!msg.pending && msg.readBy?.length === 1) ||
    (msg.readBy?.length > 1 && !hasBeenSeen);

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
        {/* Dropdown only if message is not deleted and isMine */}
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: 0.6,
                    }}
                  >
                    <EditOutlined /> Edit
                  </div>
                ),
              },
              {
                key: "delete",
                label: (
                  <div
                    onClick={handleDelete}
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
          disabled={!isMine || msg.deleted}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              background: msg.deleted
                ? "#f0f0f0"
                : isMine
                ? "#e6f0ff"
                : "#f5f5f5",
              color: msg.deleted ? "#777" : "#000",
              padding: "6px 10px 4px 10px",
              borderRadius: 10,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              position: "relative",
              minHeight: 26,
              cursor: msg.deleted ? "default" : isMine ? "pointer" : "default",
              userSelect: "text",
              fontStyle: msg.deleted ? "italic" : "normal",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!msg.deleted) {
                e.currentTarget.style.background = isMine
                  ? "#d9e8ff"
                  : "#ebebeb";
              }
            }}
            onMouseLeave={(e) => {
              if (!msg.deleted) {
                e.currentTarget.style.background = isMine
                  ? "#e6f0ff"
                  : "#f5f5f5";
              }
            }}
          >
            {/* Tail */}
            {!msg.deleted && (
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
            )}

            {/* Message text */}
            {msg.deleted ? (
              <span>This message was deleted</span>
            ) : (
              <span style={{ lineHeight: 1.4 }}>{msg.content}</span>
            )}

            {/* Time + Ticks (hide if deleted) */}
            {!msg.deleted && (
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
            )}
          </div>
        </Dropdown>
      </div>
    </List.Item>
  );
}
