// src/components/chat/ChatWindowHeader.jsx
import { Avatar, Button, Badge } from "antd";
import { MinusOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";

export default function ChatWindowHeader({
  otherUser,
  unreadCount,
  userStatus,
  onToggleMinimize,
  minimized,
  onClose,
}) {
  return (
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
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fdfdfd")}
    >
      {otherUser ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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

            <small style={{ fontSize: 11, color: "#888" }}>
              {userStatus?.[otherUser._id]?.online
                ? "Online"
                : userStatus?.[otherUser._id]?.lastSeen
                ? `last seen ${moment(
                    userStatus[otherUser._id].lastSeen
                  ).fromNow()} ago`
                : "Offline"}
            </small>
          </div>
        </div>
      ) : (
        <span style={{ fontSize: 14, color: "#888" }}>Unknown user</span>
      )}

      <div style={{ display: "flex", gap: 4 }}>
        <Button
          type="text"
          size="small"
          icon={<MinusOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMinimize(!minimized);
          }}
        />
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
  );
}
