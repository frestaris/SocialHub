import { Typography, Avatar, Input, List } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function CommentsSection({ comments }) {
  return (
    <div>
      <Title level={4}>Comments</Title>
      <Input.TextArea
        rows={3}
        placeholder="Add a comment..."
        style={{ marginBottom: "16px" }}
      />
      <List
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <div>
                  <Text strong>{item.author}</Text>{" "}
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {item.time}
                  </Text>
                </div>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
