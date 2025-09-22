import { Modal, Grid } from "antd";
import PostForm from "./PostForm";
import { useCreatePostMutation } from "../../redux/post/postApi";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../utils/handleMessage";

const { useBreakpoint } = Grid;

export default function Upload({ open, onClose }) {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const handleCreatePost = async (data) => {
    try {
      await createPost(data).unwrap();
      handleSuccess("Post created successfully!");
      if (onClose) onClose();
      navigate("/explore");
    } catch (err) {
      console.error("Create post error:", err);
      handleError(err, "Failed to create post");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "100%" : "70%"}
      style={{
        top: isMobile ? 10 : 30,
        maxWidth: isMobile ? "100%" : 600,
        padding: "0 16px",
      }}
      destroyOnHidden
    >
      <div style={{ background: "#fff", borderRadius: "12px" }}>
        <PostForm onCreatePost={handleCreatePost} loading={isLoading} />
      </div>
    </Modal>
  );
}
