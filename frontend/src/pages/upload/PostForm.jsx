import {
  Form,
  Input,
  Button,
  Select,
  Upload as AntUpload,
  message,
  Switch,
} from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../utils/fetchYouTubeMetadata";
import { auth } from "../../firebase";
import { categories } from "../../utils/categories";

const { TextArea } = Input;

export default function PostForm({ onClose, onCreatePost, loading }) {
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // toggle state
  const [useUrl, setUseUrl] = useState(false);

  // Watch fields
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrl = Form.useWatch("mediaUrl", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // YouTube metadata state
  const [ytMeta, setYtMeta] = useState(null);

  // Detect file type
  const isVideoFile =
    mediaFile?.length > 0 &&
    mediaFile[0]?.originFileObj?.type?.startsWith("video/");

  // Detect URL type
  const isYouTubeUrl =
    mediaUrl &&
    (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"));
  const isVideoUrl =
    mediaUrl &&
    (mediaUrl.endsWith(".mp4") ||
      mediaUrl.endsWith(".webm") ||
      mediaUrl.endsWith(".mov") ||
      isYouTubeUrl);
  const isImageUrl = mediaUrl && !isVideoUrl;
  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    let url;

    if (mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")) {
      // New uploaded image
      url = URL.createObjectURL(mediaFile[0].originFileObj);
    } else if (thumbnailFile?.[0]?.originFileObj) {
      // 👈 New uploaded thumbnail file
      url = URL.createObjectURL(thumbnailFile[0].originFileObj);
    } else if (isImageUrl) {
      // Direct image URL
      url = mediaUrl;
    } else if (isYouTubeUrl && ytMeta?.thumbnail) {
      // YouTube thumbnail
      url = ytMeta.thumbnail;
    }

    setPreviewSrc(url);

    return () => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [mediaFile, mediaUrl, thumbnailFile, ytMeta, isImageUrl, isYouTubeUrl]);

  // Fetch YouTube metadata (title only)
  useEffect(() => {
    let cancelled = false;
    const getMeta = async () => {
      try {
        const meta = await fetchYouTubeMetadata(mediaUrl);
        if (cancelled) return;
        setYtMeta(meta || null);

        if (meta?.title && !form.getFieldValue("title")) {
          form.setFieldsValue({ title: meta.title });
        }
      } catch {
        setYtMeta(null);
      }
    };

    if (isYouTubeUrl) {
      getMeta();
    } else {
      setYtMeta(null);
    }
    return () => {
      cancelled = true;
    };
  }, [mediaUrl, isYouTubeUrl, form]);

  // Auto-clear URL if file is chosen
  useEffect(() => {
    if (mediaFile?.length > 0 && mediaUrl) {
      form.setFieldsValue({ mediaUrl: "" });
    }
  }, [mediaFile]);

  // Auto-clear file if URL is typed
  useEffect(() => {
    if (mediaUrl && mediaFile?.length > 0) {
      form.setFieldsValue({ mediaFile: [] });
    }
  }, [mediaUrl]);

  const handleFinish = async (values) => {
    try {
      if (mediaFile?.length > 0 && mediaUrl) {
        message.error("Please use either upload OR URL, not both.");
        return;
      }

      let payload = {
        category: values.category,
        content: values.content,
      };
      let type = "text";

      // ---------- FILE ----------
      if (mediaFile?.[0]?.originFileObj) {
        const file = mediaFile[0].originFileObj;

        if (file.type.startsWith("image/")) {
          setIsUploading(true);
          const imageUrl = await uploadToFirebase(
            file,
            auth.currentUser?.uid,
            (progress) => setUploadProgress(progress),
            "posts"
          );
          payload.image = imageUrl;
          type = "image";
          setIsUploading(false);
          setUploadProgress(0);
        } else if (file.type.startsWith("video/")) {
          setIsUploading(true);
          const videoUrlUploaded = await uploadToFirebase(
            file,
            auth.currentUser?.uid,
            (progress) => setUploadProgress(progress),
            "videos"
          );
          const duration = await getVideoDuration(file);

          let thumbnailUrl = "";
          if (values.thumbnail?.[0]?.originFileObj) {
            thumbnailUrl = await uploadToFirebase(
              values.thumbnail[0].originFileObj,
              auth.currentUser?.uid,
              null,
              "videos",
              true
            );
          }

          payload.video = {
            title: values.title,
            category: values.category,
            url: videoUrlUploaded,
            thumbnail: thumbnailUrl,
            duration,
          };
          type = "video";
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // ---------- URL ----------
      else if (mediaUrl) {
        if (isImageUrl) {
          payload.image = mediaUrl.trim();
          type = "image";
        } else if (isVideoUrl) {
          const meta =
            isYouTubeUrl &&
            (ytMeta ||
              (await fetchYouTubeMetadata(mediaUrl).catch(() => null)));

          payload.video = {
            title: values.title || meta?.title || "",
            category: values.category,
            url: mediaUrl.trim(),
            thumbnail: isYouTubeUrl
              ? meta?.thumbnail || ""
              : values.thumbnailUrl || "",
            duration: meta?.duration || 0,
          };
          type = "video";
        }
      }

      payload.type = type;

      await onCreatePost(payload);
      form.resetFields();
      setYtMeta(null);
      if (onClose) onClose();
    } catch (err) {
      console.error("Create post error:", err);
      message.error("Failed to publish post");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {/* Content */}
      <Form.Item
        label="Create a Post"
        name="content"
        rules={[{ required: true, message: "Content is required" }]}
      >
        <TextArea rows={3} placeholder="What's on your mind?" />
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

      {/* Media */}
      <Form.Item label="Media">
        <div style={{ marginBottom: 12 }}>
          <Switch
            checked={useUrl}
            onChange={setUseUrl}
            checkedChildren="URL"
            unCheckedChildren="Upload"
          />
        </div>

        {/* Upload mode */}
        {!useUrl && (
          <Form.Item
            name="mediaFile"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <AntUpload
              accept="image/*,video/*"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Upload Image/Video</Button>
            </AntUpload>
          </Form.Item>
        )}

        {/* URL mode */}
        {useUrl && (
          <Form.Item name="mediaUrl">
            <Input
              prefix={<LinkOutlined />}
              placeholder="Paste image / video URL"
            />
          </Form.Item>
        )}
      </Form.Item>

      {/* Extra fields if video */}
      {(isVideoFile || isVideoUrl) && (
        <>
          <Form.Item
            label="Video Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>

          {!isYouTubeUrl && !useUrl && (
            <Form.Item
              label="Upload Thumbnail"
              name="thumbnail"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <AntUpload
                accept="image/*"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
              </AntUpload>
            </Form.Item>
          )}
        </>
      )}

      {/* Media Preview (supports image + thumbnail + YouTube) */}
      {previewSrc && (
        <div
          style={{
            position: "relative",
            marginBottom: 8,
            aspectRatio: "16/9",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          <img
            src={previewSrc}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={isUploading || loading}
      >
        {isUploading
          ? uploadProgress < 100
            ? `Uploading... ${Math.round(uploadProgress)}%`
            : "Finalizing..."
          : loading
          ? "Publishing..."
          : "Publish"}
      </Button>
    </Form>
  );
}
