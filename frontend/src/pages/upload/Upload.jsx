import { Modal, Tabs } from "antd";
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import UploadVideoForm from "./UploadVideoForm";
import PostForm from "./PostForm";

export default function Upload({ open, onClose }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="70%"
      stylesBody={{ padding: 0 }}
      destroyOnHidden
    >
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: "12px",
        }}
      >
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
              children: <PostForm />,
            },
            {
              key: "video",
              label: (
                <span>
                  <UploadOutlined /> Upload Video
                </span>
              ),
              children: <UploadVideoForm onClose={onClose} />,
            },
          ]}
        />
      </div>
    </Modal>
  );
}
