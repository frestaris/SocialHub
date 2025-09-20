import { useState, useRef, useEffect, useMemo } from "react";
import { Typography, Avatar, Button, Space, notification, Tag } from "antd";
import {
  LikeOutlined,
  UserOutlined,
  EyeOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToggleFollowUserMutation } from "../../redux/user/userApi";
import { useToggleLikePostMutation } from "../../redux/post/postApi";
import VideoPlayer from "./VideoPlayer";
import CategoryBadge from "../../components/CategoryBadge";

const { Text, Paragraph, Title } = Typography;

export default function PostInfo({ post }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const isOwner =
    currentUser && post.userId && currentUser._id === post.userId._id;
  const [toggleLikePost] = useToggleLikePostMutation();

  const hasLiked = post.likes?.some((id) => id.toString() === currentUser?._id);
  const [toggleFollowUser, { isLoading: isFollowLoading }] =
    useToggleFollowUserMutation();

  const isFollowingUser = useMemo(() => {
    if (!currentUser || !post?.userId) return false;
    return currentUser.following?.some((f) => f._id === post.userId._id);
  }, [currentUser, post]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      notification.warning({
        message: "Login Required",
        description: "Please log in to like posts.",
      });
      return;
    }

    try {
      await toggleLikePost(post._id).unwrap();
    } catch (err) {
      notification.error({
        message: "Error",
        err,
        description: "Failed to update like",
      });
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      notification.warning({
        message: "Login Required",
        description: "You need to log in to follow users.",
        btn: (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              notification.destroy();
              navigate("/login", { state: { from: `/post/${post._id}` } });
            }}
          >
            Go to Login
          </Button>
        ),
        duration: 3,
      });
      return;
    }

    try {
      await toggleFollowUser(post.userId._id).unwrap();
    } catch (err) {
      console.error("❌ Toggle follow error:", err);
    }
  };

  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10);
      const maxHeight = lineHeight * 2;
      setIsOverflowing(el.scrollHeight > maxHeight);
    }
  }, [post?.content]);

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Media */}
      {post.type === "video" && post.videoId?.url && (
        <VideoPlayer src={post.videoId.url} title={post.videoId?.title} />
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
            <Text strong>{post.userId?.username}</Text>
            <br />
            <Text type="secondary">{moment(post.createdAt).fromNow()}</Text>
          </div>
        </div>

        {!isOwner && (
          <Button
            type={isFollowingUser ? "default" : "primary"}
            size="small"
            loading={isFollowLoading}
            onClick={handleFollowToggle}
          >
            {isFollowingUser ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
      {/* Title (for video posts) */}
      {post.type === "video" && (
        <Title level={3} style={{ marginBottom: "10px" }}>
          {post.videoId?.title}
        </Title>
      )}
      {/* Content/Description */}
      <div
        style={{
          marginTop: "16px",
          background: "#e7e7e7",
          padding: "12px",
          borderRadius: "8px",
        }}
      >
        <Paragraph
          ref={descRef}
          ellipsis={!expanded ? { rows: 2, expandable: false } : false}
          style={{ marginBottom: "8px" }}
        >
          {post.type === "video"
            ? post.videoId?.description || post.content
            : post.content}
        </Paragraph>
        {isOverflowing && (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>{" "}
      {/* Actions (category, views, likes, comments) */}
      <Space style={{ marginTop: 12, marginBottom: 12 }}>
        <CategoryBadge category={post.category} />
        <Tag
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
          <EyeOutlined /> {post.views || 0}
        </Tag>
        <Tag
          style={{
            background: "#f0f0f0",
            borderRadius: "16px",
            padding: "2px 10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            margin: 0,
            cursor: "pointer",
          }}
          onClick={handleLikeToggle}
        >
          <LikeOutlined style={{ color: hasLiked ? "#1677ff" : "#555" }} />{" "}
          {post.likes?.length || 0}
        </Tag>

        <Tag
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
    </div>
  );
}
