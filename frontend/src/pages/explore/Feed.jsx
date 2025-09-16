import { Card, Avatar, Typography, Space, Grid, Spin, Result, Tag } from "antd";
import {
  LikeOutlined,
  CommentOutlined,
  CalendarOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useGetPostsQuery } from "../../redux/post/postApi";
import { Link } from "react-router-dom";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function Feed() {
  const screens = useBreakpoint();
  const isDesktop = screens.lg;

  const { data, isLoading, isError } = useGetPostsQuery();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load feed"
        subTitle="Something went wrong while fetching posts. Please try again later."
      />
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return (
      <Result
        status="404"
        title="No Posts Found"
        subTitle="Be the first to create a post!"
      />
    );
  }

  return (
    <div style={{ margin: "0 auto" }}>
      {posts.map((post) => (
        <Card
          key={post._id}
          style={{ marginBottom: 24, borderRadius: 12 }}
          stylesbody={{ padding: "16px" }}
        >
          {/* User info + type icon */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Space>
              <Avatar src={post.userId?.avatar} />
              <div>
                <Text strong>{post.userId?.username}</Text>
                <br />
                <Text type="secondary">
                  <CalendarOutlined /> {moment(post.createdAt).fromNow()}
                </Text>
              </div>
            </Space>

            <div
              style={{
                background: "#f0f0f0",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              {post.type === "video" ? (
                <VideoCameraOutlined style={{ color: "#1677ff" }} />
              ) : (
                <FileTextOutlined style={{ color: "#52c41a" }} />
              )}
            </div>
          </div>

          {/* Content */}
          {post.type === "text" && (
            <Paragraph style={{ marginTop: 8 }}>{post.content}</Paragraph>
          )}
          {post.image && (
            <div style={{ marginTop: 12 }}>
              <img
                src={post.image}
                alt="Post attachment"
                style={{
                  width: isDesktop ? "50%" : "100%",
                  borderRadius: "8px",
                  objectFit: "cover",
                  maxHeight: "220px",
                  display: "block",
                }}
              />
            </div>
          )}

          {post.type === "video" && post.videoId && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: isDesktop ? "row" : "column",
                gap: "16px",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  position: "relative",
                  flex: isDesktop ? "1 1 50%" : "1 1 100%",
                }}
              >
                <Link to={`/video/${post.videoId._id}`}>
                  <img
                    src={post.videoId.thumbnail || "/fallback-thumbnail.jpg"}
                    alt={post.videoId.title}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                      maxHeight: isDesktop ? "220px" : "300px",
                    }}
                  />
                  {post.videoId.duration > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {Math.floor(post.videoId.duration / 60)}:
                      {(post.videoId.duration % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </Link>
              </div>

              {/* Info */}
              <div style={{ flex: isDesktop ? "1 1 40%" : "1 1 100%" }}>
                <Paragraph style={{ margin: "8px 0 4px" }}>
                  <Link
                    to={`/video/${post.videoId._id}`}
                    style={{ color: "#1677ff" }}
                  >
                    {post.videoId.title}
                  </Link>
                </Paragraph>
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ margin: 0 }}
                >
                  {post.content}
                </Paragraph>
              </div>
            </div>
          )}

          <Space style={{ marginTop: 12 }}>
            <Tag
              color="default"
              style={{
                background: "#f0f0f0",
                borderRadius: "16px",
                padding: "2px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                margin: 0,
              }}
            >
              <EyeOutlined />{" "}
              {post.type === "video" && post.videoId
                ? post.videoId.views || 0
                : post.views || 0}
            </Tag>

            <Tag
              color="default"
              style={{
                background: "#f0f0f0",
                borderRadius: "16px",
                padding: "2px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                margin: 0,
              }}
            >
              <LikeOutlined /> {post.likes?.length || 0}
            </Tag>

            <Tag
              color="default"
              style={{
                background: "#f0f0f0",
                borderRadius: "16px",
                padding: "2px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                margin: 0,
              }}
            >
              <CommentOutlined /> {post.comments?.length || 0}
            </Tag>
          </Space>
        </Card>
      ))}
    </div>
  );
}
