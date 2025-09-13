import { Card, Avatar, Typography, Button } from "antd";

const { Title, Paragraph } = Typography;

export default function ProfileInfo({ user }) {
  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Avatar src={user?.avatar} size={96} style={{ marginBottom: 16 }} />
        <Title level={3}>{user?.username}</Title>
        <Paragraph type="secondary">{user?.email}</Paragraph>
        <Paragraph>{user?.bio || "No bio yet."}</Paragraph>
        <Button type="primary" block>
          Follow
        </Button>
      </div>
    </Card>
  );
}
