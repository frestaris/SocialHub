// --- React ---
import { useState } from "react";

// --- Ant Design ---
import { Avatar, Button, Badge, Input } from "antd";
import {
  MinusOutlined,
  CloseOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Time utils ---
import moment from "moment";

/**
 *
 * --------------------------------------
 * The top section of each chat window.
 *
 * Responsibilities:
 *  Display other user's avatar, name, and online status
 *  Show unread message badge
 *  Allow minimizing / closing the chat
 *  Toggle search within the conversation
 *
 * Props:
 * - otherUser: { _id, username, avatar }
 * - unreadCount: number of unread messages
 * - userStatus: { [userId]: { online, lastSeen } }
 * - minimized: bool
 * - onToggleMinimize: fn(minimized: bool)
 * - onClose: fn()
 * - onSearch: fn(value: string)
 */
export default function ChatWindowHeader({
  otherUser,
  unreadCount,
  userStatus,
  onToggleMinimize,
  minimized,
  onClose,
  onSearch,
}) {
  // --- Local state ---
  const [showSearch, setShowSearch] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");

  //  Toggle visibility of search bar
  const toggleSearch = (e) => {
    e.stopPropagation();
    if (minimized) onToggleMinimize(false);
    setShowSearch((prev) => {
      const next = !prev;
      if (!next) {
        setPendingSearch("");
        onSearch?.("");
      }
      return next;
    });
  };

  //  Trigger search
  const handleSearch = (value) => {
    if (minimized) onToggleMinimize(false);
    onSearch?.(value);
  };

  // --- Render ---
  return (
    <div style={{ position: "relative" }}>
      {/*  HEADER BAR */}
      <div
        onClick={() => onToggleMinimize(!minimized)}
        style={{
          height: 56,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fdfdfd",
          borderBottom: "1px solid #eee",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "background 0.2s",
          zIndex: 2,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#fdfdfd")}
      >
        {/*  LEFT: User info */}
        {otherUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* --- Avatar + Online indicator --- */}
            <Link to={`/profile/${otherUser._id}`}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={otherUser?.avatar || null}
                  size="medium"
                  icon={!otherUser?.avatar && <UserOutlined />}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: userStatus?.[otherUser._id]?.online
                      ? "#4caf50"
                      : "#9e9e9e",
                    border: "2px solid white",
                    boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </Link>

            {/* --- Username + status text --- */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Username link */}
                <Link
                  to={`/profile/${otherUser._id}`}
                  style={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#1677ff",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {otherUser.username}
                </Link>

                {/*  Unread badge */}
                {unreadCount > 0 && (
                  <Badge
                    count={unreadCount}
                    overflowCount={9}
                    size="small"
                    style={{
                      backgroundColor: "#ff4d4f",
                      position: "relative",
                      top: -1,
                    }}
                  />
                )}
              </div>

              {/*  Status (Online / Last seen) */}
              <small style={{ fontSize: 11, color: "#888" }}>
                {(() => {
                  const status = userStatus?.[otherUser._id];
                  if (status?.online) return "Online";
                  if (status?.lastSeen) {
                    const formatted = moment(status.lastSeen).calendar(null, {
                      sameDay: "[today at] h:mm A",
                      lastDay: "[yesterday at] h:mm A",
                      lastWeek: "dddd [at] h:mm A",
                      sameElse: "DD/MM/YYYY [at] h:mm A",
                    });
                    return `Last seen ${formatted}`;
                  }
                  return "Offline";
                })()}
              </small>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 14, color: "#888" }}>Unknown user</span>
        )}

        {/*  RIGHT: Control buttons */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {/* Search icon */}
          <Button
            type="text"
            size="small"
            icon={<SearchOutlined />}
            onClick={toggleSearch}
          />
          {/* Minimize */}
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize(!minimized);
            }}
          />
          {/* Close */}
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>

      {/*  SEARCH BAR (slides down) */}
      <div
        style={{
          height: showSearch ? 48 : 0,
          overflow: "hidden",
          transition: "height 0.25s ease",
          background: "#fff",
          borderBottom: showSearch ? "1px solid #eee" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showSearch && (
          <div
            style={{
              padding: "8px 12px",
              background: "#fafafa",
              animation: "fadeSlideDown 0.25s ease",
            }}
          >
            <Input.Search
              placeholder="Search in conversation..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              onSearch={handleSearch}
              allowClear
              style={{
                borderRadius: 8,
                background: "#fafafa",
              }}
            />
          </div>
        )}

        {/* --- Small animation for smooth dropdown --- */}
        <style>
          {`
          @keyframes fadeSlideDown {
            from {
              opacity: 0;
              transform: translateY(-6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          `}
        </style>
      </div>
    </div>
  );
}
