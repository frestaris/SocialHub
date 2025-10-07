import { Modal, List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

export default function ChatModalStart({
  isOpen,
  onClose,
  following = [],
  onStartChat,
}) {
  return (
    <Modal
      title="People You Follow"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      zIndex={1200}
      styles={{
        body: { maxHeight: "60vh", overflowY: "auto", padding: "0 16px" },
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={following}
        locale={{ emptyText: "You’re not following anyone yet" }}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
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
    </Modal>
  );
}
