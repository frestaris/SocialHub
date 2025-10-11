import { Modal, List, Avatar, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";

export default function ChatModalStart({
  isOpen,
  onClose,
  following = [],
  onStartChat,
  pendingSharePostId,
}) {
  const [searchText, setSearchText] = useState("");

  // Filter following users by name
  const filteredList = useMemo(() => {
    if (!searchText.trim()) return following;
    const lower = searchText.toLowerCase();
    return following.filter((f) => f.username?.toLowerCase().includes(lower));
  }, [following, searchText]);

  // Dynamic empty message
  const emptyMessage =
    following.length === 0
      ? "You’re not following anyone yet"
      : "No users match your search";

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
      {/* Sticky Search bar */}
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

      {/* Scrollable User list */}
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
