import { Card, Typography, Space } from "antd";
import {
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";

const { Title, Text } = Typography;

export default function FeaturedVideo({ video }) {
  if (!video) return null;

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: "12px",
        overflow: "hidden",
      }}
      cover={
        <Link to={`/video/${video.id}`}>
          <div style={{ position: "relative" }}>
            <img
              src={video.thumbnail}
              alt={video.title}
              style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
            />
            <span
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                fontSize: "13px",
                padding: "3px 6px",
                borderRadius: "4px",
              }}
            >
              {Math.floor(video.duration / 60)}:
              {(video.duration % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </Link>
      }
    >
      <Title level={4}>
        <Link to={`/video/${video.id}`} style={{ color: "#1677ff" }}>
          {video.title}
        </Link>
      </Title>

      <Space size="middle" wrap>
        <Text>
          <EyeOutlined /> {video.views}
        </Text>
        <Text>
          <LikeOutlined /> {video.likes?.length || 0}
        </Text>
        <Text>
          <CommentOutlined /> {video.comments?.length || 0}
        </Text>
        <Text>
          <CalendarOutlined /> {moment(video.createdAt).fromNow()}
        </Text>
      </Space>
    </Card>
  );
}
