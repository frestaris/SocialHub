import { Card, Avatar, Space, Tooltip, Badge, Typography } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

export default function SuggestedCreators({ followers }) {
  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
      title={
        <Space>
          <Text strong style={{ fontSize: "18px" }}>
            Followers
          </Text>
          <Badge
            count={followers.length}
            overflowCount={99} // max before showing "99+"
            style={{ backgroundColor: "#1677ff" }}
          />
        </Space>
      }
    >
      <Space wrap>
        {followers?.length > 0 ? (
          followers.map((f) => (
            <Tooltip title={f.username} key={f._id}>
              <Link to={`/profile/${f._id}`}>
                <Avatar src={f.avatar || null}>
                  {!f.avatar && f.username?.[0]}
                </Avatar>
              </Link>
            </Tooltip>
          ))
        ) : (
          <p>No followers yet</p>
        )}
      </Space>
    </Card>
  );
}
