import { Dropdown } from "antd";
import MessageEditor from "./MessageEditor";
import MessageStatusIcon from "./MessageStatusIcon";
import MessageMenu from "./MessageMenu";
import moment from "../../../utils/momentShort";

function highlightText(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} style={{ backgroundColor: "#fff176", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function MessageBubble({
  msg,
  isMine,
  isEditing,
  setIsEditing,
  editText,
  setEditText,
  handleSaveEdit,
  handleDelete,
  menuOpen,
  setMenuOpen,
  canStillEdit,
  timeSince,
  EDIT_WINDOW_MS,
  hasBeenSeen,
  isDelivered,
  searchTerm,
}) {
  return (
    <Dropdown
      menu={{
        items: MessageMenu({
          canEdit: canStillEdit,
          onEdit: () => {
            setMenuOpen(false);
            setIsEditing(true);
          },
          onDelete: handleDelete,
          msg,
          timeSince,
          EDIT_WINDOW_MS,
        }),
      }}
      trigger={["click", "contextMenu"]}
      open={!isEditing && menuOpen}
      onOpenChange={(visible) => !isEditing && setMenuOpen(visible)}
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
        {isEditing ? (
          <MessageEditor
            editText={editText}
            setEditText={setEditText}
            onCancel={() => {
              setIsEditing(false);
              setEditText(msg.content);
            }}
            onSave={handleSaveEdit}
            originalContent={msg.content}
          />
        ) : (
          <>
            <span style={{ lineHeight: 1.4 }}>
              {highlightText(msg.content, searchTerm)}
              {msg.edited && (
                <span style={{ fontSize: 10, color: "#888" }}> (edited)</span>
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
              <small style={{ color: "#8b8b8b", fontSize: 10, lineHeight: 1 }}>
                {moment(msg.createdAt).format("h:mm A")}
              </small>
              {isMine && (
                <MessageStatusIcon
                  hasBeenSeen={hasBeenSeen}
                  isDelivered={isDelivered}
                />
              )}
            </div>
          </>
        )}
      </div>
    </Dropdown>
  );
}
