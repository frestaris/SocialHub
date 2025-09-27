import { useState, useEffect, useMemo } from "react";

// --- Ant Design components ---
import { Form, Input, Button, Select, Upload as AntUpload, Switch } from "antd";

// --- Ant Design icons ---
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";

// --- Firebase ---
import { auth } from "../../firebase";
import { uploadToFirebase } from "../../utils/uploadToFirebase";

// --- Utils ---
import { getVideoDuration } from "../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../utils/fetchYouTubeMetadata";
import { handleError } from "../../utils/handleMessage";

// --- Constants ---
import { categories } from "../../utils/categories";

const { TextArea } = Input;

export default function PostForm({ onCreatePost, loading }) {
  const [form] = Form.useForm();

  // --- State ---
  const [useUpload, setUseUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ytMeta, setYtMeta] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  // --- Watch fields ---
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrl = Form.useWatch("mediaUrl", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // --- Derived booleans ---
  const isVideoFile = mediaFile?.[0]?.originFileObj?.type?.startsWith("video/");
  const isYouTubeUrl =
    mediaUrl?.includes("youtube.com") || mediaUrl?.includes("youtu.be");
  const isVideoUrl =
    mediaUrl &&
    (mediaUrl.endsWith(".mp4") ||
      mediaUrl.endsWith(".webm") ||
      mediaUrl.endsWith(".mov") ||
      isYouTubeUrl);
  const isImageUrl = mediaUrl && !isVideoUrl;

  // --- Preview handling ---
  useEffect(() => {
    let url = null;

    if (mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")) {
      url = URL.createObjectURL(mediaFile[0].originFileObj);
    } else if (thumbnailFile?.[0]?.originFileObj) {
      url = URL.createObjectURL(thumbnailFile[0].originFileObj);
    } else if (isImageUrl) {
      url = mediaUrl;
    } else if (isYouTubeUrl && ytMeta?.thumbnail) {
      url = ytMeta.thumbnail;
    }

    setPreviewSrc(url);

    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [mediaFile, mediaUrl, thumbnailFile, ytMeta, isImageUrl, isYouTubeUrl]);

  // --- Fetch YouTube metadata ---
  useEffect(() => {
    let cancelled = false;
    const fetchMeta = async () => {
      try {
        const meta = await fetchYouTubeMetadata(mediaUrl);
        if (!cancelled) {
          setYtMeta(meta || null);
          if (meta?.title && !form.getFieldValue("title")) {
            form.setFieldsValue({ title: meta.title });
          }
        }
      } catch {
        setYtMeta(null);
      }
    };

    if (isYouTubeUrl) fetchMeta();
    else setYtMeta(null);

    return () => {
      cancelled = true;
    };
  }, [mediaUrl, isYouTubeUrl, form]);

  // --- Keep only one media input active ---
  useEffect(() => {
    if (mediaFile?.length > 0 && mediaUrl) {
      form.setFieldsValue({ mediaUrl: "" });
    }
    if (mediaUrl && mediaFile?.length > 0) {
      form.setFieldsValue({ mediaFile: [] });
    }
  }, [mediaFile, mediaUrl, form]);

  // --- Submit handler ---
  const handleFinish = async (values) => {
    try {
      let payload = { category: values.category, content: values.content };
      let type = "text";

      // --- File upload path ---
      if (mediaFile?.[0]?.originFileObj) {
        const file = mediaFile[0].originFileObj;

        if (file.type.startsWith("image/")) {
          setIsUploading(true);
          const imageUrl = await uploadToFirebase(
            file,
            auth.currentUser?.uid,
            (p) => setUploadProgress(p),
            "posts"
          );
          payload.image = imageUrl;
          type = "image";
        } else if (file.type.startsWith("video/")) {
          setIsUploading(true);
          const videoUrl = await uploadToFirebase(
            file,
            auth.currentUser?.uid,
            (p) => setUploadProgress(p),
            "videos"
          );
          const duration = await getVideoDuration(file);

          let thumbnailUrl = "";
          if (thumbnailFile?.[0]?.originFileObj) {
            thumbnailUrl = await uploadToFirebase(
              thumbnailFile[0].originFileObj,
              auth.currentUser?.uid,
              null,
              "videos",
              true
            );
          }

          payload.video = {
            title: values.title,
            category: values.category,
            url: videoUrl,
            thumbnail: thumbnailUrl,
            duration,
          };
          type = "video";
        }
      }

      // --- URL path ---
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
    } catch (err) {
      console.error("❌ Create post error:", err);
      handleError(err, "Failed to publish post");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Button text ---
  const buttonLabel = useMemo(() => {
    if (isUploading) {
      return uploadProgress < 100
        ? `Uploading... ${Math.round(uploadProgress)}%`
        : "Finalizing...";
    }
    if (loading) return "Publishing...";
    return "Publish";
  }, [isUploading, uploadProgress, loading]);

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

      {/* Media toggle */}
      <Form.Item label="Media">
        <div style={{ marginBottom: 12 }}>
          <Switch
            checked={useUpload}
            onChange={setUseUpload}
            checkedChildren="Upload"
            unCheckedChildren="URL"
          />
        </div>

        {!useUpload ? (
          <Form.Item name="mediaUrl">
            <Input
              prefix={<LinkOutlined />}
              placeholder="Paste image / video URL"
            />
          </Form.Item>
        ) : (
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
      </Form.Item>

      {/* Extra video fields */}
      {(isVideoFile || isVideoUrl) && (
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

      {/* Preview */}
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

      {/* Submit */}
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={isUploading || loading}
      >
        {buttonLabel}
      </Button>
    </Form>
  );
}
