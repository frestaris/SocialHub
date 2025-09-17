import {
  Form,
  Input,
  Button,
  Upload as AntUpload,
  Select,
  message,
  Spin,
  Space,
  Switch,
  Row,
  Col,
} from "antd";
import { LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { useState } from "react";
import { auth } from "../../firebase";
import { fetchYouTubeMetadata } from "../../utils/fetchYouTubeMetadata";
import { categories } from "../../utils/categories";

const { TextArea } = Input;
const { Option } = Select;

export default function UploadVideoForm({ onClose, onCreatePost, loading }) {
  const [form] = Form.useForm();
  const userId = auth.currentUser?.uid;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState("file");

  const handleModeChange = (value) => {
    setUploadMode(value);
    if (value === "file") {
      form.setFieldsValue({ externalUrl: undefined });
    } else {
      form.setFieldsValue({ file: [] });
    }
  };

  const handleFinish = async (values) => {
    try {
      let fileURL = "";
      let duration = 0;
      let thumbnail = "";
      let title = values.title;
      let description = values.description;

      if (uploadMode === "url") {
        fileURL = values.externalUrl.trim();
        if (!fileURL.startsWith("http")) {
          fileURL = `https://${fileURL}`;
        }

        if (fileURL.includes("youtube.com") || fileURL.includes("youtu.be")) {
          const meta = await fetchYouTubeMetadata(fileURL);
          if (meta) {
            if (!values.title) title = meta.title;
            if (!values.description) description = meta.description;
            thumbnail = meta.thumbnail || thumbnail;
            duration = meta.duration || duration;
          }
        }
      } else {
        const file = values.file?.[0]?.originFileObj;
        if (!file) {
          message.error("Please upload a video file");
          return;
        }

        setUploadProgress(0);
        fileURL = await uploadToFirebase(file, userId, (progress) =>
          setUploadProgress(progress)
        );
        duration = await getVideoDuration(file);
      }

      if (values.thumbnail && values.thumbnail[0]?.originFileObj) {
        const thumbFile = values.thumbnail[0].originFileObj;
        thumbnail = await uploadToFirebase(thumbFile, userId, null);
      }

      const videoData = {
        title,
        description,
        category: values.category,
        url: fileURL,
        thumbnail,
        duration,
      };

      setIsSaving(true);
      await onCreatePost({ type: "video", video: videoData });
      setIsSaving(false);

      form.resetFields();
      setUploadProgress(0);
      if (onClose) onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      message.error("Failed to upload video");
      setUploadProgress(0);
      setIsSaving(false);
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      {/* Title */}
      <Form.Item
        label="Title"
        name="title"
        rules={[
          { required: true, message: "Title is required" },
          { min: 5, message: "Title must be at least 5 characters" },
        ]}
      >
        <Input placeholder="Enter video title" />
      </Form.Item>

      {/* Description */}
      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: "Description is required" },
          { min: 10, message: "Description must be at least 10 characters" },
        ]}
      >
        <TextArea rows={4} placeholder="Write a description..." />
      </Form.Item>

      {/* Category */}
      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          {categories.map((cat) => (
            <Select.Option key={cat.key} value={cat.key}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Toggle Mode */}
      <Form.Item label="Upload Mode">
        <Space>
          <span>File</span>
          <Switch
            checked={uploadMode === "url"}
            onChange={(checked) => handleModeChange(checked ? "url" : "file")}
          />
          <span>URL</span>
        </Space>
      </Form.Item>

      {/* File OR URL */}
      {uploadMode === "file" ? (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Upload File"
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              rules={[
                {
                  required: uploadMode === "file",
                  message: "Please upload a video file",
                },
              ]}
            >
              <AntUpload
                accept="video/*"
                beforeUpload={(file) => {
                  const isUnder50MB = file.size / 1024 / 1024 < 50;
                  if (!isUnder50MB) {
                    message.error("Video must be smaller than 50MB!");
                    return AntUpload.LIST_IGNORE;
                  }
                  return false;
                }}
                listType="text"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Video</Button>
              </AntUpload>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Upload Thumbnail"
              name="thumbnail"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              rules={[
                {
                  required: true,
                  message: "Please upload a thumbnail",
                },
              ]}
            >
              <AntUpload
                accept="image/*"
                beforeUpload={(file) => {
                  const isUnder4MB = file.size / 1024 / 1024 < 4;
                  if (!isUnder4MB) {
                    message.error("Thumbnail must be smaller than 4MB!");
                    return AntUpload.LIST_IGNORE;
                  }
                  return false;
                }}
                listType="picture"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
              </AntUpload>
            </Form.Item>
          </Col>
        </Row>
      ) : (
        <Form.Item
          label="External URL"
          name="externalUrl"
          rules={[
            {
              required: uploadMode === "url",
              message: "Please provide a video URL",
            },
          ]}
        >
          <Input
            prefix={<LinkOutlined />}
            placeholder="Paste YouTube or video URL"
          />
        </Form.Item>
      )}

      {/* Submit */}
      <Button
        type="primary"
        htmlType="submit"
        block
        disabled={uploadProgress > 0 || isSaving || loading}
      >
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <span>
            <Spin size="small" /> Uploading {Math.round(uploadProgress)}%
          </span>
        ) : uploadProgress === 100 && !isSaving ? (
          <span>
            <Spin size="small" /> Saving...
          </span>
        ) : loading || isSaving ? (
          "Publishing..."
        ) : (
          "Upload Video"
        )}
      </Button>
    </Form>
  );
}
