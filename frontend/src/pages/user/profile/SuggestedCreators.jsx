import { Card, Avatar, Space, Tooltip } from "antd";
import { Link } from "react-router-dom";

export default function SuggestedCreators({ followers }) {
  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
      title={`Followers ${followers.length}`}
    >
      <Space wrap>
        {followers?.length > 0 ? (
          followers.map((f) => (
            <Tooltip key={f._id} title={f.username}>
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
