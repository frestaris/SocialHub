import { useState } from "react";

// Ant Design
import { Space, Button } from "antd";
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  EyeOutlined,
} from "@ant-design/icons";

// Redux & Router
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToggleLikePostMutation } from "../redux/post/postApi";

// Local components & utils
import CategoryBadge from "./CategoryBadge";
import CommentsSection from "../pages/post/CommentsSection";
import {
  clearNotifications,
  handleError,
  handleWarning,
} from "../utils/handleMessage";

export default function PostActions({
  post,
  isSmall,
  showCommentsSection = true,
}) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [toggleLikePost] = useToggleLikePostMutation();

  const [showComments, setShowComments] = useState(false);

  // check if current user has liked the post
  const hasLiked = post.likes?.some((id) => id.toString() === currentUser?._id);

  // ---- Handlers ----
  const handleLikeToggle = async () => {
    if (!currentUser) {
      // redirect unauthenticated users to login
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
        {/* Category (left) */}
        <CategoryBadge category={post.category} />

        {/* Actions (right) */}
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

      {/* Expandable comments section */}
      {showCommentsSection && showComments && (
        <div style={{ marginTop: 16 }}>
          <CommentsSection postId={post._id} />
        </div>
      )}
    </div>
  );
}
