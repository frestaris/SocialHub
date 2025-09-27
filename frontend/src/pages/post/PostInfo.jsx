import { useState, useMemo } from "react";

// --- Libraries ---
import { Typography, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

// --- Utils ---
import moment from "moment";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Redux ---
import { useSelector } from "react-redux";

// --- Components ---
import VideoPlayer from "./VideoPlayer";
import FollowButton from "../../components/FollowButton";
import PostActions from "../../components/post/PostActions";

const { Text, Paragraph, Title } = Typography;

export default function PostInfo({ post }) {
  const [expanded, setExpanded] = useState(false);

  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner =
    currentUser && post.userId && currentUser._id === post.userId._id;

  // --- Derived state: following ---
  const isFollowingUser = useMemo(() => {
    if (!currentUser || !post?.userId) return false;
    return currentUser.following?.some((f) => f._id === post.userId._id);
  }, [currentUser, post]);

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Media (video or image) */}
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
          {/* Avatar */}
          <Link to={`/profile/${post.userId._id}`}>
            <Avatar
              src={post.userId?.avatar || null}
              size="large"
              icon={!post.userId?.avatar && <UserOutlined />}
            />
          </Link>

          {/* Username + timestamp */}
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
            </Link>
            <br />
            <Text type="secondary">
              {moment(post.createdAt).fromNow()}
              {post.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
            </Text>
          </div>
        </div>

        {/* Follow button (hidden for owner) */}
        {!isOwner && (
          <FollowButton
            userId={post.userId._id}
            isFollowing={isFollowingUser}
            isOwner={isOwner}
            size="small"
          />
        )}
      </div>

      {/* Title (only for video posts) */}
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

          {/* Expand/Collapse toggle */}
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

      {/* Post actions (likes, comments, share) */}
      <PostActions post={post} isSmall={false} showCommentsSection={false} />
    </div>
  );
}
