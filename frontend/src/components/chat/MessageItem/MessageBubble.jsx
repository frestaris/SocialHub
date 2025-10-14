// --- Ant Design ---
import { Dropdown } from "antd";

// --- Components ---
import MessageEditor from "./MessageEditor";
import MessageStatusIcon from "./MessageStatusIcon";
import MessageMenu from "./MessageMenu";
import PostPreviewBubble from "./PostPreviewBubble";

// --- Utils ---
import moment from "../../../utils/momentShort";
import { Link } from "react-router-dom";

/**
 * Helper: Highlight search term inside text
 */
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

/**
 * Helper: Render message content
 * - Detects links
 * - If it's a post link, renders a preview bubble
 * - Otherwise, wraps clickable links or highlights search term
 */
function renderMessageContent(text, searchTerm) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex)?.[0];
  const postMatch = match?.match(/\/post\/([A-Za-z0-9_-]+)(?:$|\b|\/|\?|#)/);

  // If link refers to a post → show preview
  if (postMatch) {
    const postId = postMatch[1];
    return <PostPreviewBubble postId={postId} />;
  }

  // Otherwise render text with clickable URLs
  const segments = text.split(urlRegex);
  return segments.map((segment, i) => {
    if (urlRegex.test(segment)) {
      return (
        <Link
          key={i}
          to={segment.replace(window.location.origin, "")}
          onClick={() => window.dispatchEvent(new CustomEvent("closeAllChats"))}
          style={{
            color: "#1677ff",
            textDecoration: "underline",
            wordBreak: "break-all",
          }}
        >
          {segment}
        </Link>
      );
    } else {
      return <span key={i}>{highlightText(segment, searchTerm)}</span>;
    }
  });
}

/**
 *
 * --------------------------------------
 * Displays the message bubble itself — handles edit mode, context menu, and status icons.
 *
 * Responsibilities:
 *  Renders message text (with highlight & links)
 *  Shows "edited" label if applicable
 *  Renders post preview if message includes post link
 *  Supports inline edit mode
 *  Integrates dropdown menu for edit/delete
 *  Shows message time & delivery/seen icons
 */
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
        {/*  Message tail triangle */}
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

        {/*  Edit Mode or Read Mode */}
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
            {/*  Message content */}
            <span style={{ lineHeight: 1.4 }}>
              {renderMessageContent(msg.content, searchTerm)}
              {msg.edited && (
                <span style={{ fontSize: 10, color: "#888" }}> (edited)</span>
              )}
            </span>

            {/*  Time + Status */}
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
