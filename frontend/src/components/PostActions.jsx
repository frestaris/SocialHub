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

  return (
    <div
      style={{
        width: "100%",
        marginTop: 12,
        paddingTop: 12,
      }}
    >
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          flexWrap: "wrap",
          borderTop: "1px solid #f0f0f0",
          marginTop: 12,
          paddingTop: 8,
        }}
      >
        {/* Category on the left */}
        <CategoryBadge category={post.category} />

        {/* Actions on the right */}
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: isSmall ? 13 : 15,
            color: "#555",
          }}
        >
          {/* Views */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <EyeOutlined />
            <span>{post.views || 0}</span>
          </div>

          {/* Likes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              color: hasLiked ? "#1677ff" : "#555",
              fontWeight: hasLiked ? 600 : 400,
            }}
            onClick={handleLikeToggle}
          >
            {hasLiked ? <LikeFilled /> : <LikeOutlined />}
            <span>{post.likes?.length || 0}</span>
          </div>

          {/* Comments */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: showCommentsSection ? "pointer" : "default",
              color: showComments ? "#1677ff" : "#555",
              fontWeight: showComments ? 600 : 400,
            }}
            onClick={
              showCommentsSection
                ? () => setShowComments(!showComments)
                : undefined
            }
          >
            <CommentOutlined />
            <span>{post.comments?.length || 0}</span>
          </div>
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
