import {
  Card,
  Avatar,
  Typography,
  Grid,
  Spin,
  Result,
  Dropdown,
  Button,
  Modal,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  useGetPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../redux/post/postApi";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import EditPostForm from "../user/profile/EditPostForm";
import Masonry from "react-masonry-css";
import TopCreators from "./TopCreators";
import HotNow from "./HotNow";
import SuggestedForYou from "./SuggestedForYou";
import PostActions from "../../components/PostActions";
import { handleError, handleSuccess } from "../../utils/handleMessage";

const breakpointColumns = { default: 3, 1100: 2, 700: 1 };
const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function Feed({ searchQuery = "", selectedCategories = [] }) {
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const loaderRef = useRef();
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const isSmall = !screens.sm;
  const currentUser = useSelector((state) => state.auth.user);

  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  // 🔹 fetch posts directly from RTK Query (no local posts state)
  const { data, isLoading, isFetching, isError } = useGetPostsQuery(
    {
      searchQuery,
      category: selectedCategories[0] || "",
      skip,
      limit,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const posts = data?.posts || [];
  const total = data?.total || 0;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && posts.length < total) {
          setSkip((prev) => {
            const next = prev + limit;
            return next;
          });
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [isFetching, posts.length, total, limit]);

  const handleDeleteConfirm = async () => {
    try {
      if (!deletingPost) return;
      await deletePost({
        id: deletingPost._id,
        userId: deletingPost.userId?._id,
        sort: "newest",
      }).unwrap();

      handleSuccess("Post deleted!");
      setDeletingPost(null);
    } catch (err) {
      console.error("❌ Error deleting post:", err);
      handleError(err, "Delete post");
    }
  };

  if ((isLoading || isFetching) && skip === 0) {
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

  if (posts.length === 0 && !isFetching) {
    return (
      <Result
        status="404"
        title="No Posts Found"
        subTitle="Be the first to create a post!"
      />
    );
  }

  // group posts into chunks for injected components
  const chunkSize = 9;
  const chunks = Array.from(
    { length: Math.ceil(posts.length / chunkSize) },
    (_, i) => posts.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  const injectedComponents = [
    <TopCreators key="top-creators" />,
    <HotNow key="hot-now" />,
    <SuggestedForYou key="suggested-for-you" />,
  ];

  return (
    <>
      {chunks.map((chunkPosts, chunkIndex) => (
        <div key={chunkIndex}>
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {chunkPosts.map((post) => (
              <Card
                key={post._id}
                style={{
                  breakInside: "avoid",
                  marginBottom: 16,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                stylesbody={{ padding: "12px" }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
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
                        style={{
                          display: "block",
                          fontSize: isSmall ? 12 : 14,
                        }}
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

                {/* Media */}
                {post.type === "video" && post.video && (
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
                        src={post.video.thumbnail || "/fallback-thumbnail.jpg"}
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
                            bottom: "8px",
                            right: "8px",
                            background: "rgba(0,0,0,0.75)",
                            color: "#fff",
                            fontSize: "12px",
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

                {/* Content */}
                {post.type === "video" ? (
                  <>
                    <Paragraph
                      style={{ margin: "0 0 4px", fontSize: isSmall ? 13 : 15 }}
                      ellipsis={{ rows: 2 }}
                    >
                      <Link
                        to={`/post/${post._id}`}
                        style={{ color: "#000", fontWeight: 600 }}
                      >
                        {post.video?.title}
                      </Link>
                    </Paragraph>
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0, fontSize: isSmall ? 13 : 15 }}
                    >
                      {post.content}
                    </Paragraph>
                  </>
                ) : (
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

                {/* Footer */}
                <PostActions post={post} isSmall={isSmall} />
              </Card>
            ))}
          </Masonry>

          {chunkIndex < injectedComponents.length && (
            <div style={{ margin: "32px 0" }}>
              {injectedComponents[chunkIndex]}
            </div>
          )}
        </div>
      ))}

      {/* Infinite scroll loader */}
      <div
        ref={loaderRef}
        style={{ height: 60, textAlign: "center", padding: "16px" }}
      >
        {isFetching && skip > 0 && <Spin />}
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editingPost}
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
    </>
  );
}
