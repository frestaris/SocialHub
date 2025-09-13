import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function StreamInfo({ creator, viewers }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <Avatar
        size="large"
        icon={<UserOutlined />}
        style={{ marginRight: "12px" }}
      />
      <Text strong>{creator}</Text> <br />
      <Text type="secondary">{viewers}</Text>
    </div>
  );
}
