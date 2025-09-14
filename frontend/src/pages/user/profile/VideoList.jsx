import { Card, List, Space, Typography, Grid } from "antd";
import {
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function VideoList({ videos, sortBy, setSortBy }) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const renderThumbnail = (video, style = {}) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{
          width: "100%",
          height: style.height || "180px",
          objectFit: "cover",
          borderRadius: "8px",
          ...style,
        }}
      />
      {/* Duration overlay */}
      <span
        style={{
          position: "absolute",
          bottom: "6px",
          right: "6px",
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          fontSize: "12px",
          padding: "2px 6px",
          borderRadius: "4px",
        }}
      >
        {Math.floor(video.duration / 60)}:
        {(video.duration % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <Card
      title="All Videos"
      extra={
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <option value="popularity">Most Popular</option>
          <option value="oldest">Oldest</option>
          <option value="newest">Newest</option>
        </select>
      }
    >
      <List
        itemLayout={isMobile ? "vertical" : "horizontal"}
        dataSource={videos}
        renderItem={(video) => (
          <List.Item>
            {isMobile ? (
              //  Mobile layout
              <Card
                hoverable
                cover={
                  <Link to={`/video/${video._id}`}>
                    {renderThumbnail(video)}
                  </Link>
                }
              >
                <Link to={`/video/${video._id}`}>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: "8px" }}
                  >
                    {video.title}
                  </Text>
                </Link>

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
            ) : (
              //  Desktop layout
              <List.Item.Meta
                avatar={
                  <Link to={`/video/${video._id}`}>
                    {renderThumbnail(video, {
                      width: "120px",
                      height: "80px",
                    })}
                  </Link>
                }
                title={
                  <Link to={`/video/${video._id}`} style={{ color: "#1677ff" }}>
                    {video.title}
                  </Link>
                }
                description={
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
                }
              />
            )}
          </List.Item>
        )}
      />
    </Card>
  );
}
