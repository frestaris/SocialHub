import { Tabs } from "antd";
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";

import UploadVideoForm from "./UploadVideoForm";
import PostForm from "./PostForm";

export default function Upload() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#fafafa",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Tabs
          defaultActiveKey="video"
          items={[
            {
              key: "video",
              label: (
                <span>
                  <UploadOutlined /> Upload Video
                </span>
              ),
              children: <UploadVideoForm />,
            },
            {
              key: "post",
              label: (
                <span>
                  <FileTextOutlined /> Create Post
                </span>
              ),
              children: <PostForm />,
            },
          ]}
        />
      </div>
    </div>
  );
}
