import { useState, useMemo } from "react";
import { Typography, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import FollowButton from "../../components/FollowButton";
import PostActions from "../../components/PostActions";

const { Text, Paragraph, Title } = Typography;

export default function PostInfo({ post }) {
  const [expanded, setExpanded] = useState(false);

  const currentUser = useSelector((state) => state.auth.user);
  const isOwner =
    currentUser && post.userId && currentUser._id === post.userId._id;

  const isFollowingUser = useMemo(() => {
    if (!currentUser || !post?.userId) return false;
    return currentUser.following?.some((f) => f._id === post.userId._id);
  }, [currentUser, post]);

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Media */}
      {post.type === "video" && post.video?.url && (
        <VideoPlayer src={post.video.url} title={post.video?.title} />
      )}
      {post.image && (
        <div style={{ marginTop: "16px" }}>
          <img
            src={post.image}
            alt="Post attachment"
            style={{
              marginBottom: "12px",
              width: "100%",
              borderRadius: "8px",
              objectFit: "cover",
              maxHeight: "400px",
              display: "block",
            }}
          />
        </div>
      )}

      {/* User header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to={`/profile/${post.userId._id}`}>
            <Avatar
              src={post.userId?.avatar || null}
              size="large"
              icon={!post.userId?.avatar && <UserOutlined />}
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.userId?._id}`}
              style={{
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              <Text style={{ color: "#1677ff" }} strong>
                {post.userId?.username}
              </Text>
            </Link>{" "}
            <br />
            <Text type="secondary">
              {moment(post.createdAt).fromNow()}
              {post.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
            </Text>
          </div>
        </div>

        {!isOwner && (
          <FollowButton
            userId={post.userId._id}
            isFollowing={isFollowingUser}
            isOwner={isOwner}
            size="small"
          />
        )}
      </div>

      {/* Title (for video posts) */}
      {post.type === "video" && (
        <Title level={3} style={{ marginBottom: "10px" }}>
          {post.video?.title}
        </Title>
      )}

      {/* Content/Description */}
      {post.content && (
        <div
          style={{
            marginTop: "16px",
            background: "#e7e7e7",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              maxHeight: expanded ? "500px" : "60px",
              overflow: "hidden",
              transition: "max-height 0.5s ease",
            }}
          >
            <Paragraph style={{ margin: 0, whiteSpace: "pre-line" }}>
              {post.content}
            </Paragraph>
          </div>

          {post.content.length > 120 && (
            <Button
              type="link"
              style={{ padding: 0, fontSize: 12 }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
          )}
        </div>
      )}

      <PostActions post={post} isSmall={false} showCommentsSection={false} />
    </div>
  );
}
