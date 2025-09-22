import { useState } from "react";
import { Space, Tag, Button } from "antd";
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import CategoryBadge from "./CategoryBadge";
import CommentsSection from "../pages/post/CommentsSection";
import { useToggleLikePostMutation } from "../redux/post/postApi";
import {
  clearNotifications,
  handleError,
  handleWarning,
} from "../utils/handleMessage";
import { useNavigate } from "react-router-dom";

export default function PostActions({
  post,
  isSmall,
  showCommentsSection = true,
}) {
  const currentUser = useSelector((state) => state.auth.user);
  const [toggleLikePost] = useToggleLikePostMutation();
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  const hasLiked = post.likes?.some((id) => id.toString() === currentUser?._id);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      handleWarning(
        "Login Required",
        "You need to log in to like posts.",
        <Button
          type="primary"
          size="small"
          onClick={() => {
            clearNotifications();
            navigate("/login", { state: { from: `/post/${post._id}` } });
          }}
        >
          Go to Login
        </Button>
      );
      return;
    }

    try {
      await toggleLikePost(post._id).unwrap();
    } catch (err) {
      handleError(err, "Failed to update like");
    }
  };

  const baseTagStyle = {
    borderRadius: "16px",
    padding: "4px 12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    margin: 0,
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        width: "100%",
        marginTop: 12,
        borderTop: "1px solid #f0f0f0",
        paddingTop: 12,
      }}
    >
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <CategoryBadge category={post.category} />

        <div style={{ display: "flex", gap: 12 }}>
          {/* Views */}
          <Tag
            style={{
              ...baseTagStyle,
              fontSize: isSmall ? 11 : 13,
              background: "#f0f0f0",
              cursor: "default",
            }}
          >
            <EyeOutlined /> {post.views || 0}
          </Tag>

          {/* Likes */}
          <Tag
            style={{
              ...baseTagStyle,
              fontSize: isSmall ? 11 : 13,
              background: "#f0f0f0",
              color: hasLiked ? "#1677ff" : "#555",
              cursor: "pointer",
            }}
            onClick={handleLikeToggle}
          >
            {hasLiked ? <LikeFilled /> : <LikeOutlined />}{" "}
            {post.likes?.length || 0}
          </Tag>

          {/* Comments */}
          <Tag
            style={{
              ...baseTagStyle,
              fontSize: isSmall ? 11 : 13,
              background: showComments ? "#e6f4ff" : "#f0f0f0",
              color: showComments ? "#1677ff" : "#555",
              cursor: showCommentsSection ? "pointer" : "default",
            }}
            onClick={
              showCommentsSection
                ? () => setShowComments(!showComments)
                : undefined
            }
          >
            <CommentOutlined /> {post.comments?.length || 0}
          </Tag>
        </div>
      </Space>

      {/* Expandable comment section (only if enabled) */}
      {showCommentsSection && showComments && (
        <div style={{ marginTop: "16px" }}>
          <CommentsSection postId={post._id} />
        </div>
      )}
    </div>
  );
}
