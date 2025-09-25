import { Grid, Spin, Result, Modal, Button } from "antd";
import { useSelector } from "react-redux";
import {
  useGetPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../redux/post/postApi";
import { useState, useEffect, useRef } from "react";
import EditPostForm from "../user/profile/EditPostForm";
import Masonry from "react-masonry-css";
import TopCreators from "./TopCreators";
import { handleError, handleSuccess } from "../../utils/handleMessage";
import PostCard from "../../components/PostCard";
import HotNow from "../homepage/HotNow";
import Upload from "../upload/Upload";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const breakpointColumns = { default: 3, 1100: 2, 700: 1 };
const { useBreakpoint } = Grid;

export default function Feed({ searchQuery = "", selectedCategories = [] }) {
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const loaderRef = useRef();
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const isSmall = !screens.sm;
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [uploadOpen, setUploadOpen] = useState(false);
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
      <>
        <Result
          status="404"
          title="No Posts Found"
          subTitle="Be the first to create a post!"
          extra={
            currentUser ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setUploadOpen(true);
                }}
              >
                Post
              </Button>
            ) : (
              <Button type="primary" onClick={() => navigate("/login")}>
                Login
              </Button>
            )
          }
        />

        {/* Upload modal (only when logged in) */}
        {currentUser && (
          <Upload open={uploadOpen} onClose={() => setUploadOpen(false)} />
        )}
      </>
    );
  }

  // group posts into chunks for injected components
  const chunkSize = 12;
  const chunks = Array.from(
    { length: Math.ceil(posts.length / chunkSize) },
    (_, i) => posts.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  const injectedComponents = [
    <HotNow key="hot-now" />,
    <TopCreators key="top-creators" />,
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
              <div key={post._id}>
                <div className="fade-slide-in">
                  <PostCard
                    post={post}
                    isSmall={isSmall}
                    currentUser={currentUser}
                    onEdit={setEditingPost}
                    onDelete={setDeletingPost}
                  />
                </div>
              </div>
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
