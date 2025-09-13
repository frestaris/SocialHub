import { Avatar, List, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";

export default function ChatBox({ messages, isDesktop }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f9f9f9",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        maxHeight: isDesktop ? "600px" : "300px",
      }}
    >
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
        }}
      >
        Live Chat
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
        }}
      >
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item key={msg.id} style={{ padding: "4px 0" }}>
              <List.Item.Meta
                avatar={<Avatar size="small" icon={<UserOutlined />} />}
                title={<strong>{msg.author}</strong>}
                description={msg.content}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
        <Input placeholder="Send a message..." />
      </div>
    </div>
  );
}
