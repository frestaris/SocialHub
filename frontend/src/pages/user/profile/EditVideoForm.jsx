// -----------------------------------------
// -----     REMOVE THIS COMPONENT     -----
//------------------------------------------

import {
  Form,
  Input,
  Button,
  Upload as AntUpload,
  Select,
  Space,
  Switch,
  message,
  Spin,
  Row,
  Col,
} from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";
import { getVideoDuration } from "../../../utils/getVideoDuration";
import { auth } from "../../../firebase";
import { fetchYouTubeMetadata } from "../../../utils/fetchYouTubeMetadata";
import { categories } from "../../../utils/categories";

const { TextArea } = Input;

export default function EditVideoForm({
  post,
  open,
  onClose,
  onUpdate,
  loading,
}) {
  const [form] = Form.useForm();
  const userId = auth.currentUser?.uid;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState(
    post.video?.url?.startsWith("http") ? "url" : "file"
  );
  const [isChanged, setIsChanged] = useState(false);

  const initialValues = {
    title: post.video?.title,
    description: post.content, // description lives in content
    category: post.category,
    externalUrl: post.video?.url?.startsWith("http") ? post.video.url : null,
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
      setUploadProgress(0);
      setIsSaving(false);
    }
  }, [open, post]);

  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) => allValues[key] !== initialValues[key]
    );
    setIsChanged(changed);
  };

  const handleModeChange = (checked) => {
    setUploadMode(checked ? "url" : "file");
  };

  const handleFinish = async (values) => {
    try {
      let fileURL = post.video?.url || "";
      let duration = post.video?.duration || 0;
      let thumbnail = post.video?.thumbnail || "";
      let title = values.title;
      let description = values.description;

      // --- URL mode ---
      if (uploadMode === "url" && values.externalUrl) {
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
      }

      // --- File mode ---
      if (uploadMode === "file" && values.file?.[0]?.originFileObj) {
        const file = values.file[0].originFileObj;
        fileURL = await uploadToFirebase(file, userId, (progress) =>
          setUploadProgress(progress)
        );
        duration = await getVideoDuration(file);
      }

      // --- Thumbnail (only if not YouTube) ---
      const isYouTube =
        fileURL.includes("youtube.com") || fileURL.includes("youtu.be");
      if (!isYouTube && values.thumbnail?.[0]?.originFileObj) {
        const thumbFile = values.thumbnail[0].originFileObj;
        thumbnail = await uploadToFirebase(
          thumbFile,
          userId,
          null,
          "thumbnails"
        );
      }

      if (!fileURL) {
        message.error("Video URL is required.");
        return;
      }

      const videoData = {
        title,
        url: fileURL,
        thumbnail,
        duration,
      };

      setIsSaving(true);
      await onUpdate({
        id: post._id,
        video: videoData,
        content: description,
        category: values.category,
      }).unwrap();

      message.success("Video updated!");
      setIsSaving(false);
      if (onClose) onClose();
    } catch (err) {
      console.error("Update video failed:", err);
      message.error("Failed to update video");
      setUploadProgress(0);
      setIsSaving(false);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Title is required" }]}
      >
        <Input placeholder="Enter video title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <TextArea rows={4} placeholder="Write a description..." />
      </Form.Item>

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

      <Form.Item label="Upload Mode">
        <Space>
          <span>File</span>
          <Switch checked={uploadMode === "url"} onChange={handleModeChange} />
          <span>URL</span>
        </Space>
      </Form.Item>

      {uploadMode === "file" ? (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Upload File"
              name="file"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[
                {
                  required: uploadMode === "file",
                  message: "Video file is required",
                },
              ]}
            >
              <AntUpload
                accept="video/*"
                listType="text"
                maxCount={1}
                beforeUpload={() => false}
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
              getValueFromEvent={(e) => e?.fileList}
              rules={[
                {
                  required: true,
                  message: "Thumbnail is required",
                },
              ]}
            >
              <AntUpload
                accept="image/*"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
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
            { required: true, message: "Video URL is required" },
            { type: "url", message: "Please enter a valid URL" },
          ]}
        >
          <Input prefix={<LinkOutlined />} placeholder="Paste video URL" />
        </Form.Item>
      )}

      <Button
        type="primary"
        htmlType="submit"
        block
        disabled={!isChanged || uploadProgress > 0 || isSaving || loading}
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
          "Saving..."
        ) : (
          "Save Changes"
        )}
      </Button>
    </Form>
  );
}
