import {
  Card,
  Typography,
  Dropdown,
  Button,
  Modal,
  Grid,
  Spin,
  Result,
} from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../../redux/post/postApi";
import { useState } from "react";
import EditPostForm from "./EditPostForm";
import { Link } from "react-router-dom";
import PostActions from "../../../components/PostActions";
import { handleError, handleSuccess } from "../../../utils/handleMessage";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function UserFeed({ feed, isLoading, currentUserId, sortBy }) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const handleEdit = (post) => setEditingPost(post);

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

  if (!feed || feed.length === 0) {
    return (
      <Result
        status="404"
        title="No Posts Yet"
        subTitle="This user hasn’t shared any posts or videos."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {feed.map((item) => (
        <Card key={item._id} style={{ borderRadius: 12 }}>
          {/* Header: date + dropdown */}
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

            {currentUserId === (item.userId?._id || item.creatorId?._id) && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: "Edit",
                      icon: <EditOutlined />,
                      onClick: () => handleEdit(item),
                    },
                    {
                      key: "delete",
                      label: "Delete",
                      danger: true,
                      icon: <DeleteOutlined />,
                      onClick: () => setDeletingPost(item),
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

          {/* Content */}
          <>
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
              {item.type === "image" && item.image && (
                <div style={{ flex: isMobile ? "0 0 100%" : "0 0 50%" }}>
                  <Link to={`/post/${item._id}`}>
                    <img
                      src={item.image}
                      alt="Post image"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        height: isMobile ? "auto" : "180px",
                        objectFit: isMobile ? "contain" : "cover",
                      }}
                    />
                  </Link>
                </div>
              )}

              {/* Content / Description */}
              {item.content && (
                <Paragraph style={{ flex: 1, margin: 0 }}>
                  <Link to={`/post/${item._id}`} style={{ color: "inherit" }}>
                    {item.content}
                  </Link>
                </Paragraph>
              )}
            </div>
          </>
          <PostActions post={item} isSmall={isMobile} />
        </Card>
      ))}

      {/* ---- Edit Modal ---- */}
      <Modal
        open={!!editingPost}
        title="Edit Post"
        onCancel={() => setEditingPost(null)}
        footer={null}
        width={isMobile ? "100%" : "70%"}
        style={{
          top: isMobile ? 5 : 30,
          maxWidth: isMobile ? "100%" : 600,
          padding: "0 16px",
        }}
        destroyOnHidden
      >
        <EditPostForm
          post={editingPost}
          open={!!editingPost}
          onUpdate={updatePost}
          onClose={() => setEditingPost(null)}
          loading={isUpdatingPost}
        />
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
            ? deletingPost?.video?.title
            : "this post"}
        </b>
        ?
      </Modal>
    </div>
  );
}
