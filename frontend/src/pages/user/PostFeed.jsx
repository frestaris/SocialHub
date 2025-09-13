import { Card, Typography } from "antd";
import moment from "moment";

const { Text, Paragraph } = Typography;

export default function PostFeed({ posts }) {
  if (!posts?.length) {
    return <Text type="secondary">No posts yet.</Text>;
  }

  return (
    <div>
      {posts.map((post) => (
        <Card
          key={post.id}
          style={{
            marginBottom: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Text strong>{post.author}</Text>
          <Paragraph style={{ marginTop: "8px", marginBottom: "8px" }}>
            {post.content}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {moment(post.createdAt).fromNow()}
          </Text>
        </Card>
      ))}
    </div>
  );
}
