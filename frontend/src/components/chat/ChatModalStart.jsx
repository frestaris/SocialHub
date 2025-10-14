// --- Ant Design ---
import { Modal, List, Avatar, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";

// --- React ---
import { useState, useMemo } from "react";

/**
 *
 * --------------------------------------
 * Displays a modal for starting a new chat or sharing a post.
 *
 * Responsibilities:
 *  Lists all users the current user follows
 *  Provides search bar to filter by username
 *  Calls onStartChat(userId) when a user is selected
 *  Dynamically changes title if sharing a post
 *
 * Props:
 * - isOpen: bool → whether modal is visible
 * - onClose: fn → close handler
 * - following: array of user objects [{ _id, username, avatar }]
 * - onStartChat: fn(userId) → triggers conversation creation
 * - pendingSharePostId: optional string (if sharing a post)
 */
export default function ChatModalStart({
  isOpen,
  onClose,
  following = [],
  onStartChat,
  pendingSharePostId,
}) {
  const [searchText, setSearchText] = useState("");

  /**
   *  Filter following users by username
   */
  const filteredList = useMemo(() => {
    if (!searchText.trim()) return following;
    const lower = searchText.toLowerCase();
    return following.filter((f) => f.username?.toLowerCase().includes(lower));
  }, [following, searchText]);

  /**
   *  Dynamic empty state message
   */
  const emptyMessage =
    following.length === 0
      ? "You’re not following anyone yet"
      : "No users match your search";

  // --- Render ---
  return (
    <Modal
      title={
        pendingSharePostId ? "Share this post with..." : "People You Follow"
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      zIndex={1200}
      styles={{
        body: {
          maxHeight: "60vh",
          overflowY: "auto",
          padding: 0,
          position: "relative",
        },
      }}
    >
      {/*  Sticky search bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "8px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Input.Search
          placeholder="Search by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            borderRadius: 8,
            background: "#fafafa",
            border: "1px solid #e5e5e5",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
          }}
        />
      </div>

      {/*  Scrollable user list */}
      <div
        style={{
          padding: "8px 16px",
          maxHeight: "calc(60vh - 56px)",
          overflowY: "auto",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredList}
          locale={{ emptyText: emptyMessage }}
          renderItem={(f) => (
            <List.Item
              key={f._id}
              onClick={() => onStartChat(f._id)}
              style={{
                cursor: "pointer",
                borderRadius: 8,
                padding: "6px 10px",
                marginBottom: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={f.avatar || null}
                    icon={!f.avatar && <UserOutlined />}
                  />
                }
                title={<span style={{ color: "#1677ff" }}>{f.username}</span>}
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}
