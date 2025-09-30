// --- Ant Design ---
import { Card, Typography, Button, Grid, Spin, Result, Tooltip } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

// --- React ---
import { useState } from "react";
import moment from "../../../utils/momentShort";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Redux ---
import {
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleHidePostMutation,
} from "../../../redux/post/postApi";

// --- Components ---
import PostActions from "../../../components/post/PostActions";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";
import PostModals from "../../../components/post/PostModals";
import PostDropdown from "../../../components/post/PostDropdown";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function UserFeed({ feed, isLoading, currentUserId, sortBy }) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const isMedium = !screens.md; // between md and lg

  // --- Local state ---
  const [expandedPostId, setExpandedPostId] = useState(null); // track expanded text
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [hidingPostId, setHidingPostId] = useState(null);

  // --- Mutations ---
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [toggleHidePost] = useToggleHidePostMutation();

  const handleDeleteConfirm = async () => {
    try {
      if (!deletingPost) return;
      await deletePost({
        id: deletingPost._id,
        userId: deletingPost.userId?._id || currentUserId,
        sort: sortBy,
      }).unwrap();

      handleSuccess("Post deleted successfully!");
      setDeletingPost(null);
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      handleError(err, "Failed to delete post");
    }
  };

  const handleToggleHide = async (post) => {
    setHidingPostId(post._id);
    try {
      await toggleHidePost(post._id).unwrap();
    } catch (err) {
      console.error("❌ Hide/show failed:", err);
      handleError(err, "Failed to hide post");
    } finally {
      setHidingPostId(null);
    }
  };

  // --- Loading state ---
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

  // --- Empty state ---
  if (!feed || feed.length === 0) {
    return (
      <Result
        status="404"
        title="No Posts Yet"
        subTitle="This user hasn’t shared any posts or videos."
        style={{
          overflowX: "hidden",
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {feed.map((item) => (
        <Card key={item._id} style={{ borderRadius: 12 }}>
          {/* --- Header: timestamp + dropdown (owner only) --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              • {moment(item.createdAt).fromNow()}
              {item.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
            </Text>

            {/* Dropdown and visibility */}
            {currentUserId === (item.userId?._id || item.creatorId?._id) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tooltip
                  title={item.hidden ? "Hidden from feed" : "Visible to others"}
                  placement="top"
                >
                  <div style={{ display: "inline-flex", alignItems: "center" }}>
                    {hidingPostId === item._id ? (
                      <Spin size="small" />
                    ) : item.hidden ? (
                      <EyeInvisibleOutlined
                        style={{ fontSize: 18, cursor: "pointer" }}
                        onClick={() => handleToggleHide(item)}
                      />
                    ) : (
                      <EyeOutlined
                        style={{ fontSize: 18, cursor: "pointer" }}
                        onClick={() => handleToggleHide(item)}
                      />
                    )}
                  </div>
                </Tooltip>

                <PostDropdown
                  item={item}
                  onEdit={setEditingPost}
                  onDelete={setDeletingPost}
                  onHide={handleToggleHide}
                  size="large"
                  showHideOption={false}
                />
              </div>
            )}
          </div>

          {/* --- Post Content --- */}
          <>
            {/* Video title */}
            {item.type === "video" && (
              <Text
                strong
                style={{ fontSize: 16, display: "block", marginBottom: 12 }}
              >
                {item.video?.title}
              </Text>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "16px",
                alignItems: "flex-start",
                marginTop: 12,
              }}
            >
              {/* Video Thumbnail */}
              {item.type === "video" && item.video?.thumbnail && (
                <div
                  style={{
                    flex: isMobile ? "0 0 100%" : "0 0 50%",
                    position: "relative",
                  }}
                >
                  <Link to={`/post/${item._id}`}>
                    <img
                      src={item.video.thumbnail}
                      alt="Video thumbnail"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        height: isMobile ? "auto" : "180px",
                        objectFit: isMobile ? "contain" : "cover",
                      }}
                    />
                    {item.video?.duration > 0 && (
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
                        {Math.floor(item.video.duration / 60)}:
                        {(item.video.duration % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Image Post */}
              {item.type === "image" && item.images?.length > 0 && (
                <div
                  style={{
                    flex: isMobile ? "0 0 100%" : "0 0 50%",
                    display: "grid",
                    gap: "4px",
                    gridTemplateColumns:
                      isMobile || isMedium
                        ? "1fr" // stacked column
                        : item.images.length === 1
                        ? "1fr"
                        : "1fr 1fr", // side by side for large screens
                  }}
                >
                  {item.images.slice(0, 2).map((img, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <Link to={`/post/${item._id}`}>
                        <img
                          src={img}
                          alt={`Post attachment ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: isMobile ? "auto" : "180px",
                            objectFit: isMobile ? "contain" : "cover",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "block",
                          }}
                        />
                      </Link>

                      {/* Overlay on the second image if there are more */}
                      {idx === 1 && item.images.length > 2 && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            fontSize: 20,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                          }}
                        >
                          +{item.images.length - 2}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Text content */}
              {item.content && (
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      maxHeight: expandedPostId === item._id ? "500px" : "60px",
                      overflow: "hidden",
                      transition: "max-height 0.5s ease",
                    }}
                  >
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-line" }}>
                      <Link
                        to={`/post/${item._id}`}
                        style={{ color: "inherit" }}
                      >
                        {item.content}
                      </Link>
                    </Paragraph>
                  </div>

                  {item.content.length > 120 && (
                    <Button
                      type="link"
                      style={{ padding: 0, fontSize: 12 }}
                      onClick={() =>
                        setExpandedPostId(
                          expandedPostId === item._id ? null : item._id
                        )
                      }
                    >
                      {expandedPostId === item._id ? "Show Less" : "Show More"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>

          {/* --- Actions (like/comment/share) --- */}
          <PostActions post={item} isSmall={isMobile} />
        </Card>
      ))}

      {/* Post Setting dropdown */}
      <PostModals
        editingPost={editingPost}
        deletingPost={deletingPost}
        isMobile={isMobile}
        isUpdating={isUpdatingPost}
        isDeleting={isDeletingPost}
        onUpdate={updatePost}
        onCloseEdit={() => setEditingPost(null)}
        onCloseDelete={() => setDeletingPost(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
