import { Modal, Tabs, message } from "antd";
import { FileTextOutlined, VideoCameraOutlined } from "@ant-design/icons";
import UploadVideoForm from "./UploadVideoForm";
import PostForm from "./PostForm";
import { useCreatePostMutation } from "../../redux/post/postApi";
import { useNavigate } from "react-router-dom";

export default function Upload({ open, onClose }) {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const navigate = useNavigate();

  const handleCreatePost = async (data) => {
    try {
      await createPost(data).unwrap();
      message.success("Post created successfully!");
      if (onClose) onClose();

      navigate("/explore");
    } catch (err) {
      console.error("Create post error:", err);
      message.error("Failed to create post");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="70%"
      destroyOnHidden
    >
      <div style={{ background: "#fff", borderRadius: "12px" }}>
        <Tabs
          defaultActiveKey="post"
          items={[
            {
              key: "post",
              label: (
                <span>
                  <FileTextOutlined /> Create Post
                </span>
              ),
              children: (
                <PostForm
                  onClose={onClose}
                  onCreatePost={handleCreatePost}
                  loading={isLoading}
                />
              ),
            },
            {
              key: "video",
              label: (
                <span>
                  <VideoCameraOutlined /> Upload Video
                </span>
              ),
              children: (
                <UploadVideoForm
                  onClose={onClose}
                  onCreatePost={handleCreatePost}
                  loading={isLoading}
                />
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
