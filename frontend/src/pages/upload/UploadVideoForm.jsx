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
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useCreateVideoMutation } from "../../redux/video/videoApi";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../firebase";
const { TextArea } = Input;
const { Option } = Select;

const fetchYouTubeMetadata = async (url) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  if (!match) return null;

  const videoId = match[1];
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items[0];
    if (!item) return null;

    const parseDuration = (iso) => {
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match[1] || 0, 10);
      const minutes = parseInt(match[2] || 0, 10);
      const seconds = parseInt(match[3] || 0, 10);
      return hours * 3600 + minutes * 60 + seconds;
    };

    return {
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(item.contentDetails.duration),
    };
  } catch (err) {
    console.error("YouTube API fetch failed:", err);
    return null;
  }
};

export default function UploadVideoForm({ onClose }) {
  const [form] = Form.useForm();
  const [createVideo] = useCreateVideoMutation();
  const currentUser = useSelector((state) => state.auth.user);
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

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
          try {
            const meta = await fetchYouTubeMetadata(fileURL);
            if (meta) {
              if (!values.title) title = meta.title;
              if (!values.description) description = meta.description;
              thumbnail = meta.thumbnail || thumbnail;
              duration = meta.duration || duration;
            }
          } catch (err) {
            console.warn("Failed to fetch YouTube metadata:", err);
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
      await createVideo(videoData).unwrap();
      setIsSaving(false);

      message.success("Video added successfully!");
      setUploadProgress(0);
      if (onClose) onClose();
      navigate(`/profile/${currentUser._id}`);
    } catch (err) {
      console.error("Upload failed:", err);
      message.error("Failed to upload video");
      setUploadProgress(0);
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
          <Option value="gaming">Gaming</Option>
          <Option value="music">Music</Option>
          <Option value="art">Art</Option>
          <Option value="fitness">Fitness</Option>
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
          <Input placeholder="Paste YouTube or video URL" />
        </Form.Item>
      )}

      {/* Submit */}
      <Button
        type="primary"
        htmlType="submit"
        block
        disabled={uploadProgress > 0 || isSaving}
      >
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <span>
            <Spin size="small" /> Uploading {Math.round(uploadProgress)}%
          </span>
        ) : uploadProgress === 100 && !isSaving ? (
          <span>
            <Spin size="small" /> Saving...
          </span>
        ) : (
          "Upload Video"
        )}
      </Button>
    </Form>
  );
}
