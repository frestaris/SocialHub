import { Form, Input, Button, Upload as AntUpload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function VideoFields({ isYouTubeUrl, useUpload }) {
  return (
    <>
      <Form.Item
        label="Video Title"
        name="title"
        rules={[{ required: true, message: "Title is required" }]}
      >
        <Input placeholder="Enter video title" />
      </Form.Item>

      {!isYouTubeUrl && useUpload && (
        <Form.Item
          label="Upload Thumbnail"
          name="thumbnail"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <AntUpload
            accept=".jpg,.jpeg,.png"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
          </AntUpload>
        </Form.Item>
      )}
    </>
  );
}
