import {
  Form,
  Input,
  Button,
  Upload as AntUpload,
  Select,
  message,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useCreateVideoMutation } from "../../redux/video/videoApi";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const { TextArea } = Input;
const { Option } = Select;

// 🔹 Helper: fetch YouTube metadata client-side
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

    // Parse ISO8601 duration → seconds
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
  const [createVideo] = useCreateVideoMutation();
  const currentUser = useSelector((state) => state.auth.user);
  const userId = currentUser?.uid;
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async (values) => {
    try {
      let fileURL = "";
      let duration = 0;
      let thumbnail = "";
      let title = values.title;
      let description = values.description;

      if (values.externalUrl) {
        // ✅ External (YouTube, etc.)
        fileURL = values.externalUrl.trim();

        // Always normalize to https://
        if (!fileURL.startsWith("http")) {
          fileURL = `https://${fileURL}`;
        }

        // Handle YouTube
        if (fileURL.includes("youtube.com") || fileURL.includes("youtu.be")) {
          try {
            const meta = await fetchYouTubeMetadata(fileURL);
            if (meta) {
              title = meta.title || title;
              description = meta.description || description;
              thumbnail = meta.thumbnail || thumbnail;
              duration = meta.duration || duration;
            }
          } catch (err) {
            console.warn(
              "Failed to fetch YouTube metadata, falling back:",
              err
            );
          }
        }
      } else {
        // ✅ Firebase upload
        const file = values.file?.[0]?.originFileObj;
        if (!file) {
          message.error(
            "Please upload a video file or provide an external URL"
          );
          return;
        }

        setUploadProgress(0);

        fileURL = await uploadToFirebase(file, userId, (progress) => {
          setUploadProgress(progress);
        });
        duration = await getVideoDuration(file);
      }
      if (values.thumbnail && values.thumbnail[0]?.originFileObj) {
        const thumbFile = values.thumbnail[0].originFileObj;
        thumbnail = await uploadToFirebase(thumbFile, userId, null); // reuse upload function
      }

      // 🔹 Final payload
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
    <Form layout="vertical" onFinish={handleFinish}>
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

      {/* File Upload */}
      <Form.Item
        label="Upload File"
        name="file"
        valuePropName="fileList"
        getValueFromEvent={(e) => e && e.fileList}
      >
        <AntUpload beforeUpload={() => false} listType="text" maxCount={1}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </AntUpload>
      </Form.Item>

      {/* External URL */}
      <Form.Item label="Or External URL" name="externalUrl">
        <Input placeholder="Paste YouTube or video URL" />
      </Form.Item>
      {/* Thumbnail Upload */}
      <Form.Item
        label="Upload Thumbnail"
        name="thumbnail"
        valuePropName="fileList"
        getValueFromEvent={(e) => e && e.fileList}
      >
        <AntUpload beforeUpload={() => false} listType="picture" maxCount={1}>
          <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
        </AntUpload>
      </Form.Item>

      {/* Progress bar */}
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
