import { useState } from "react";

// --- Redux ---
import { useSelector } from "react-redux";
import {
  useGetPostsQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../redux/post/postApi";

// --- Libraries ---
import { Typography, Modal, Grid } from "antd";

// --- Components ---
import ReusableCarousel from "../../components/ReusableCarousel";
import EditPostForm from "../user/profile/EditPostForm";
import PostCard from "../../components/PostCard";

// --- Utils ---
import { handleError, handleSuccess } from "../../utils/handleMessage";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function HotNow() {
  // --- Fetch trending posts ---
  const { data, isLoading } = useGetPostsQuery({
    sort: "trending",
    limit: 8,
  });

  // --- Breakpoints ---
  const screens = useBreakpoint();
  const isSmall = !screens.md;

  // --- Deduplicate posts by ID ---
  const posts = (data?.posts || []).filter(
    (p, i, arr) => arr.findIndex((x) => x._id === p._id) === i
  );

  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);

  // --- Local state for modals ---
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  // --- Mutations ---
  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  // --- Loading/empty guard ---
  if (isLoading || posts.length === 0) return null;

  // --- Delete confirm handler ---
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
    <div>
      {/* Section Title */}
      <Title level={2}>Hot Now</Title>

      {/* Carousel wrapper (gutters aligned with Feed) */}
      <div style={{ marginLeft: -8, marginRight: -8 }}>
        <ReusableCarousel
          slidesToShow={{
            default: 3.2,
            lg: 2.2,
            md: 2.2,
            sm: 1.2,
            xs: 1.1,
          }}
        >
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                display: "flex",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <PostCard
                post={post}
                isSmall={isSmall}
                currentUser={currentUser}
                onEdit={setEditingPost}
                onDelete={setDeletingPost}
              />
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
