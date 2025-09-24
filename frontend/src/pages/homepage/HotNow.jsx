import { Typography, Card, Avatar, Dropdown, Button, Modal, Grid } from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  useGetPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../redux/post/postApi";
import ReusableCarousel from "../../components/ReusableCarousel";
import PostActions from "../../components/PostActions";
import EditPostForm from "../user/profile/EditPostForm";
import { handleError, handleSuccess } from "../../utils/handleMessage";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function HotNow() {
  const { data, isLoading } = useGetPostsQuery({
    sort: "trending",
    limit: 8,
  });

  const screens = useBreakpoint();
  const isSmall = !screens.md;
  const posts = [...(data?.posts || [])]
    .filter((p, i, arr) => arr.findIndex((x) => x._id === p._id) === i)
    .sort((a, b) => (b.views || 0) - (a.views || 0));

  const currentUser = useSelector((state) => state.auth.user);

  // 🔹 state for edit/delete modals
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  if (isLoading || posts.length === 0) return null;

  const handleDeleteConfirm = async () => {
    try {
      if (!deletingPost) return;
      await deletePost({
        id: deletingPost._id,
        userId: deletingPost.userId?._id,
        sort: "trending",
      }).unwrap();
      handleSuccess("Post deleted!");
      setDeletingPost(null);
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      handleError(err, "Delete post");
    }
  };

  return (
    <div id="hot-now" style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ margin: "0 auto", textAlign: "center" }}>
        <Title
          level={2}
          style={{
            marginTop: isSmall ? "84px" : "84px",
            marginBottom: "64px",
          }}
        >
          Hot Now
        </Title>

        <ReusableCarousel>
          {posts.map((post) => (
            <div key={post._id} style={{ padding: "0 8px" }}>
              <Card
                style={{
                  maxWidth: 350,
                  minHeight: 370,
                  width: "100%",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
                styles={{
                  body: {
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  },
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Avatar
                      size={isSmall ? "small" : "large"}
                      src={post.userId?.avatar || null}
                      icon={!post.userId?.avatar && <UserOutlined />}
                    />

                    <div>
                      <Text strong>
                        <Link to={`/profile/${post.userId?._id}`}>
                          {post.userId?.username}
                        </Link>
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {moment(post.createdAt).fromNow()}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Owner controls */}
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

                {/* Media / Content */}
                <div
                  style={{
                    flexGrow: 1,
                    marginBottom: 8,
                    aspectRatio: "16/9",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: post.type === "text" ? "16px" : 0,
                    position: post.type !== "text" ? "relative" : "static",
                  }}
                >
                  {post.type === "video" && post.video?.thumbnail ? (
                    <Link
                      to={`/post/${post._id}`}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={post.video.thumbnail}
                        alt={post.video.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {post.video.duration > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "6px",
                            right: "6px",
                            background: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {Math.floor(post.video.duration / 60)}:
                          {(post.video.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      )}
                    </Link>
                  ) : post.image ? (
                    <Link
                      to={`/post/${post._id}`}
                      style={{ width: "100%", height: "100%" }}
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
                    </Link>
                  ) : post.type === "text" ? (
                    <Link
                      to={`/post/${post._id}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Paragraph
                        ellipsis={{ rows: 6 }}
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          fontStyle: "italic",
                          marginBottom: 0,
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        {post.content}
                      </Paragraph>
                    </Link>
                  ) : null}
                </div>

                {/* Title/Content Preview */}
                {post.type === "video" ? (
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    <Link to={`/post/${post._id}`} style={{ color: "inherit" }}>
                      {post.video?.title}
                    </Link>
                  </Paragraph>
                ) : post.image ? (
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 8, fontSize: 14, textAlign: "left" }}
                  >
                    <Link to={`/post/${post._id}`} style={{ color: "inherit" }}>
                      {post.content}
                    </Link>
                  </Paragraph>
                ) : null}

                {/* Footer Actions */}
                <PostActions
                  post={post}
                  showCommentsSection={false}
                  isSmall={isSmall}
                />
              </Card>
            </div>
          ))}
        </ReusableCarousel>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editingPost}
        onCancel={() => setEditingPost(null)}
        footer={null}
        width="70%"
        style={{ top: 30, maxWidth: 600 }}
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
      {/* Delete Modal */}
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
