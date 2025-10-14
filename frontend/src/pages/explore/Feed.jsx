import { useState, useEffect, useRef } from "react";

// --- Routing ---
import { useNavigate } from "react-router-dom";

// --- Redux ---
import { useSelector } from "react-redux";
import {
  useGetPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleHidePostMutation,
} from "../../redux/post/postApi";

// --- Libraries ---
import { Grid, Spin, Result, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Masonry from "react-masonry-css";

// --- Components ---
import TopCreators from "./TopCreators";
import PostCard from "../../components/post/cards/PostCard";
import HotNow from "./HotNow";
import Upload from "../../components/post/modals/Upload";
import GradientButton from "../../components/common/GradientButton";

// --- Utils ---
import { handleError, handleSuccess } from "../../utils/handleMessage";
import PostModals from "../../components/post/modals/PostModals";

const { useBreakpoint } = Grid;
const breakpointColumns = { default: 3, 1100: 2, 700: 1 };

export default function Feed({ searchQuery = "", selectedCategories = [] }) {
  // --- State ---
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const loaderRef = useRef();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [hidingPostId, setHidingPostId] = useState(null);

  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);

  // --- Hooks ---
  const screens = useBreakpoint();
  const isSmall = !screens.sm;
  const navigate = useNavigate();

  // --- Mutations ---
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [toggleHidePost, { isLoading: isTogglingHide }] =
    useToggleHidePostMutation();

  // --- Fetch posts ---
  const { data, isLoading, isFetching, isError } = useGetPostsQuery(
    {
      searchQuery,
      category: selectedCategories[0] || "",
      skip,
      limit,
    },
    { refetchOnMountOrArgChange: true }
  );

  const posts = data?.posts || [];
  const total = data?.total || 0;

  // --- Infinite scroll observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && posts.length < total) {
          setSkip((prev) => prev + limit);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [isFetching, posts.length, total, limit]);

  // --- Delete post confirm ---
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

  // --- Toggle hide post ---
  const handleToggleHide = async (post) => {
    setHidingPostId(post._id);
    try {
      await toggleHidePost(post._id).unwrap();
    } catch (err) {
      console.error("❌ Hide/show failed:", err);
    } finally {
      setHidingPostId(null);
    }
  };

  // --- Loading state (initial load only) ---
  if ((isLoading || isFetching) && skip === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: 24,
              }}
            >
              {/* --- Skeleton: Post info (avatar, text, etc.) --- */}
              <div style={{ padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Skeleton.Avatar active size={40} shape="circle" />
                  <Skeleton.Input
                    active
                    style={{ width: 120, height: 16 }}
                    size="small"
                  />
                </div>
                {/* --- Skeleton: Media (image/video placeholder) --- */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: "8px 8px 0 0",
                    background: "#f0f0f0",
                    overflow: "hidden",
                    marginTop: 12,
                    position: "relative",
                  }}
                >
                  <Skeleton.Image
                    active
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      borderRadius: 8,
                    }}
                  />
                </div>
                <Skeleton.Input
                  active
                  block
                  style={{ marginTop: 10, height: 16 }}
                  size="small"
                />
                <Skeleton
                  paragraph={{ rows: 2 }}
                  active
                  style={{ marginTop: 8 }}
                />
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load feed"
        subTitle="Something went wrong while fetching posts. Please try again later."
      />
    );
  }

  // --- Empty state ---
  if (posts.length === 0 && !isFetching) {
    return (
      <>
        <Result
          status="404"
          title="No Posts Found"
          subTitle="Be the first to create a post!"
          extra={
            currentUser ? (
              <GradientButton
                icon={<PlusOutlined />}
                text="Post"
                onClick={() => setUploadOpen(true)}
              />
            ) : (
              <GradientButton text="Login" onClick={() => navigate("/login")} />
            )
          }
        />

        {/* Upload modal (only if logged in) */}
        {currentUser && (
          <Upload open={uploadOpen} onClose={() => setUploadOpen(false)} />
        )}
      </>
    );
  }

  const visiblePosts = posts.filter(
    (p) => !p.hidden || p.userId?._id === currentUser?._id
  );

  // --- Group posts into chunks for injecting components ---
  const chunkSize = 12;
  const chunks = Array.from(
    { length: Math.ceil(visiblePosts.length / chunkSize) },
    (_, i) => visiblePosts.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  const injectedComponents = [
    <TopCreators key="top-creators" />,
    <HotNow key="hot-now" />,
  ];

  return (
    <>
      {/* Feed chunks with masonry layout */}
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
                    onHide={handleToggleHide}
                    isTogglingHide={hidingPostId === post._id && isTogglingHide}
                  />
                </div>
              </div>
            ))}
          </Masonry>

          {/* Inject HotNow/TopCreators between chunks */}
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

      {/* Post Setting dropdown */}
      <PostModals
        editingPost={editingPost}
        deletingPost={deletingPost}
        isUpdating={isUpdatingPost}
        isDeleting={isDeletingPost}
        onUpdate={updatePost}
        onCloseEdit={() => setEditingPost(null)}
        onCloseDelete={() => setDeletingPost(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </>
  );
}
