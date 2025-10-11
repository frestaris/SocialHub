import { Card, Avatar, Skeleton } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useGetPostByIdQuery } from "../../../redux/post/postApi";

export default function PostPreviewBubble({ postId }) {
  const { data, isLoading } = useGetPostByIdQuery(postId, { skip: !postId });
  const post = data?.post;

  if (isLoading)
    return (
      <div style={{ marginTop: 6 }}>
        <Skeleton.Avatar active size="small" shape="square" />
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      </div>
    );

  if (!post) return null;

  const isVideo = post.type === "video";
  const thumb =
    (isVideo && post.video?.thumbnail) ||
    post.images?.[0] ||
    "/fallback-thumbnail.jpg";

  return (
    <Link
      to={`/post/${post._id}`}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("closeAllChats"));
      }}
      style={{ textDecoration: "none" }}
    >
      <Card
        size="small"
        hoverable
        style={{
          marginTop: 6,
          borderRadius: 10,
          overflow: "hidden",
          background: "#fff",
          cursor: "pointer",
          boxShadow: "none",
          transition: "none",
        }}
        styles={{
          body: { padding: 8 },
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 6,
              overflow: "hidden",
              flexShrink: 0,
              background: "#f5f5f5",
            }}
          >
            <img
              src={thumb}
              alt="post thumbnail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {isVideo && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#555",
                  marginBottom: 2,
                }}
              >
                🎥 {post.video?.title}
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                color: "#666",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {post.content}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
              }}
            >
              <Avatar
                size={20}
                src={post.userId?.avatar}
                icon={<UserOutlined />}
              />
              <span style={{ fontSize: 12, color: "#888" }}>
                {post.userId?.username}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
