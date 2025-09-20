import {
  Card,
  Avatar,
  Typography,
  Space,
  Grid,
  Spin,
  Result,
  Tag,
  Dropdown,
  Button,
  Modal,
  message,
  notification,
} from "antd";
import {
  LikeOutlined,
  CommentOutlined,
  EyeOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useToggleLikePostMutation } from "../../redux/post/postApi";
import moment from "moment";
import { useGetPostsQuery } from "../../redux/post/postApi";
import { Link } from "react-router-dom";
import CategoryBadge from "../../components/CategoryBadge";
import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../redux/post/postApi";
import { useState } from "react";
import EditPostForm from "../user/profile/EditPostForm";
import EditVideoForm from "../user/profile/EditVideoForm";
import Masonry from "react-masonry-css";

const breakpointColumns = { default: 3, 1100: 2, 700: 1 };
const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function Feed() {
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const isSmall = !screens.sm;
  const currentUser = useSelector((state) => state.auth.user);
  const [toggleLikePost] = useToggleLikePostMutation();
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  const { data, isLoading, isError } = useGetPostsQuery();
  const handleDeleteConfirm = async () => {
    try {
      if (!deletingPost) return;
      await deletePost({
        id: deletingPost._id,
        userId: deletingPost.userId?._id,
        sort: "newest",
      }).unwrap();
      message.success("Post deleted!");
      setDeletingPost(null);
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      message.error("Failed to delete post");
    }
  };

  const handleLikeToggle = async (post) => {
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
        description: "Failed to update like",
      });
      console.error("❌ Like toggle failed:", err);
    }
  };
  const tagStyle = {
    background: "#f0f0f0",
    borderRadius: "16px",
    padding: "2px 10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    margin: 0,
    cursor: "pointer",
  };
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
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {posts.map((post) => (
        <Card
          key={post._id}
          hoverable
          style={{
            breakInside: "avoid",
            marginBottom: 16,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          stylesbody={{ padding: "12px" }}
        >
          {/* Header: avatar + username + time */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar
                size="large"
                src={
                  post.userId?.avatar
                    ? `${post.userId.avatar}?t=${post.userId._id}`
                    : null
                }
                icon={!post.userId?.avatar && <UserOutlined />}
              />
              <div>
                <Text
                  strong
                  style={{ display: "block", fontSize: isSmall ? 12 : 14 }}
                >
                  <Link to={`/profile/${post.userId._id}`}>
                    {post.userId?.username}
                  </Link>
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isSmall ? 10 : 12,
                  }}
                >
                  {moment(post.createdAt).fromNow()}
                  {post.edited && (
                    <span style={{ marginLeft: 6 }}>(edited)</span>
                  )}
                </Text>
              </div>
            </div>

            {/* Dropdown if current user is owner */}
            {currentUser?._id === post.userId?._id && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: "Edit",
                      icon: <EditOutlined />,
                      onClick: () => setEditingPost(post),
                    },
                    {
                      key: "delete",
                      label: "Delete",
                      danger: true,
                      icon: <DeleteOutlined />,
                      onClick: () => setDeletingPost(post),
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="large"
                  icon={<MoreOutlined style={{ fontSize: 20 }} />}
                  shape="circle"
                />
              </Dropdown>
            )}
          </div>

          {/* Media (video thumbnail or image) */}
          {post.type === "video" && post.videoId && (
            <Link to={`/post/${post._id}`}>
              <div
                style={{
                  position: "relative",
                  marginBottom: 8,
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={post.videoId.thumbnail || "/fallback-thumbnail.jpg"}
                  alt={post.videoId.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
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
              </div>
            </Link>
          )}

          {post.image && (
            <Link to={`/post/${post._id}`}>
              <div
                style={{
                  position: "relative",
                  marginBottom: 8,
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={post.image}
                  alt="Post attachment"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Link>
          )}

          {/* Title & description/content */}
          {post.type === "video" ? (
            <>
              {/* Title */}
              <Paragraph
                style={{ margin: "0 0 4px", fontSize: isSmall ? 13 : 15 }}
                ellipsis={{ rows: 2 }}
              >
                <Link
                  to={`/post/${post._id}`}
                  style={{ color: "#000", fontWeight: 600 }}
                >
                  {post.videoId?.title}
                </Link>
              </Paragraph>

              {/* Description */}
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ margin: 0, fontSize: isSmall ? 13 : 15 }}
              >
                {post.videoId?.description}
              </Paragraph>
            </>
          ) : (
            /* Text post */
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 3 }}
              style={{ margin: "4px 0 0" }}
            >
              <Link to={`/post/${post._id}`} style={{ color: "inherit" }}>
                {post.content}
              </Link>
            </Paragraph>
          )}

          {/* Footer badges */}
          <Space style={{ marginTop: 12, flexWrap: "wrap" }}>
            <CategoryBadge category={post.category} />
            <Tag
              style={{
                ...tagStyle,
                fontSize: isSmall ? 11 : 13,
              }}
            >
              <EyeOutlined /> {post.views || 0}
            </Tag>
            <Tag
              style={{
                ...tagStyle,
                fontSize: isSmall ? 11 : 13,
              }}
              onClick={() => handleLikeToggle(post)}
            >
              <LikeOutlined
                style={{
                  color: post.likes?.some(
                    (id) => id.toString() === currentUser?._id
                  )
                    ? "#1677ff"
                    : "#555",
                }}
              />{" "}
              {post.likes?.length || 0}
            </Tag>
            <Tag
              style={{
                ...tagStyle,
                fontSize: isSmall ? 11 : 13,
              }}
            >
              <CommentOutlined /> {post.comments?.length || 0}
            </Tag>
          </Space>
        </Card>
      ))}
      {/* ---- Edit Modal ---- */}
      <Modal
        open={!!editingPost}
        title="Edit Post"
        onCancel={() => setEditingPost(null)}
        footer={null}
        width={isDesktop ? "70%" : "100%"}
        style={{
          top: isDesktop ? 30 : 5,
          maxWidth: isDesktop ? 600 : "100%",
          padding: "0 16px",
        }}
        destroyOnHidden
      >
        {editingPost?.type === "video" ? (
          <EditVideoForm
            post={editingPost}
            open={!!editingPost}
            onUpdate={updatePost}
            onClose={() => setEditingPost(null)}
            loading={isUpdatingPost}
          />
        ) : (
          <EditPostForm
            post={editingPost}
            open={!!editingPost}
            onUpdate={updatePost}
            onClose={() => setEditingPost(null)}
            loading={isUpdatingPost}
          />
        )}
      </Modal>

      {/* ---- Delete Modal ---- */}
      <Modal
        open={!!deletingPost}
        title="Confirm Delete"
        okText="Yes, delete"
        okType="danger"
        confirmLoading={isDeletingPost}
        onCancel={() => setDeletingPost(null)}
        onOk={handleDeleteConfirm}
      >
        Are you sure you want to delete{" "}
        <b>
          {deletingPost?.type === "video"
            ? deletingPost?.videoId?.title
            : "this post"}
        </b>
        ?
      </Modal>
    </Masonry>
  );
}
