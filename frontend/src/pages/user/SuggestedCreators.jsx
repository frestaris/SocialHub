import { Card, Avatar, Space } from "antd";

export default function SuggestedCreators({ creators }) {
  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
      title="Creators I Like"
    >
      <Space wrap>
        {creators.map((c) => (
          <Avatar key={c.id} src={c.avatar} title={c.name} />
        ))}
      </Space>
    </Card>
  );
}
