import { List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "../../utils/momentShort";

export default function MessageItem({ msg }) {
  return (
    <List.Item
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: msg.isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "6px 12px",
          borderRadius: 12,
          background: msg.isMine ? "#1677ff" : "#f0f0f0",
          color: msg.isMine ? "#fff" : "#000",
        }}
      >
        {msg.content}
      </div>
      <small style={{ color: "#888", marginTop: 2 }}>
        {moment(msg.createdAt).fromNow()}
        {msg.seenAt && ` • Seen`}
      </small>
    </List.Item>
  );
}
