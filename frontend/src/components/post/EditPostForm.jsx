import { useState, useEffect } from "react";

// --- Ant Design ---
import { Form, Input, Button, Select, Upload as AntUpload, Switch } from "antd";

// --- Ant Design Icons ---
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";

// --- Firebase ---
import { auth } from "../../firebase";
import { uploadToFirebase } from "../../utils/uploadToFirebase";

// --- Utils ---
import { getVideoDuration } from "../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../utils/fetchYouTubeMetadata";
import { handleError, handleSuccess } from "../../utils/handleMessage";

// --- Constants ---
import { categories } from "../../utils/categories";

const { TextArea } = Input;

export default function EditPostForm({
  post,
  open,
  onClose,
  onUpdate,
  loading,
}) {
  // --- Form state ---
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChanged, setIsChanged] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  // --- Toggle state (URL vs Upload) ---
  const [useUrl, setUseUrl] = useState(
    post?.image?.startsWith("http") || post?.video?.url?.startsWith("http")
  );

  // --- Watch fields ---
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrl = Form.useWatch("mediaUrl", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // --- YouTube metadata ---
  const [ytMeta, setYtMeta] = useState(null);

  // --- File/URL type checks ---
  const isVideoFile =
    mediaFile?.length > 0 &&
    mediaFile[0]?.originFileObj?.type?.startsWith("video/");
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

  // --- Prefill initial values ---
  const initialValues = {
    content: post?.content,
    category: post?.category,
    title: post?.video?.title,
    mediaUrl: post?.video?.url || post?.image || "",
  };

  // --- Effects ---

  // Cleanup YouTube fields when switching to upload mode (non-URL)
  useEffect(() => {
    if (!isYouTubeUrl && !useUrl) {
      form.setFieldsValue({
        thumbnail: [], // remove YouTube thumbnail
        title: form.getFieldValue("title") || "", // preserve manual title if typed
      });
    }
  }, [isYouTubeUrl, useUrl, form]);

  // If user selects an image (file or URL), wipe video-specific fields
  useEffect(() => {
    if (
      isImageUrl ||
      mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")
    ) {
      // clear values
      form.setFieldsValue({
        thumbnail: [],
        title: "",
      });
    }
  }, [isImageUrl, mediaFile, form]);

  // Reset form values when modal opens or post changes
  useEffect(() => {
    if (open && post) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  // Generate preview image for uploads, URLs, or YouTube
  useEffect(() => {
    let url;
    let isBlob = false;

    if (mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")) {
      // New uploaded image
      url = URL.createObjectURL(mediaFile[0].originFileObj);
      isBlob = true;
    } else if (thumbnailFile?.[0]?.originFileObj) {
      // New uploaded video thumbnail
      url = URL.createObjectURL(thumbnailFile[0].originFileObj);
      isBlob = true;
    } else if (post?.video?.thumbnail) {
      // Existing video thumbnail from DB
      url = post.video.thumbnail;
    } else if (post?.image) {
      // Existing image from DB
      url = post.image;
    } else if (isImageUrl && !isVideoUrl) {
      // Direct image URL
      url = mediaUrl;
    } else if (isYouTubeUrl && ytMeta?.thumbnail) {
      //  YouTube-provided thumbnail
      url = ytMeta.thumbnail;
    }

    setPreviewSrc(url);

    // cleanup: revoke blob URLs to avoid memory leaks
    return () => {
      if (isBlob && url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [
    mediaFile,
    thumbnailFile,
    mediaUrl,
    ytMeta,
    isImageUrl,
    isVideoUrl,
    isYouTubeUrl,
    post,
  ]);

  //  Fetch YouTube metadata (title + thumbnail) when a YouTube URL is entered
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

    // cancel fetch if component unmounts
    return () => {
      cancelled = true;
    };
  }, [mediaUrl, isYouTubeUrl, form]);

  // --- Handlers ---
  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) => allValues[key] !== initialValues[key]
    );
    setIsChanged(changed);
  };

  const handleFinish = async (values) => {
    try {
      let payload = {
        id: post._id,
        category: values.category,
        content: values.content,
      };
      let type = "text";

      // ----- FILE -----
      if (!useUrl && mediaFile?.[0]?.originFileObj) {
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
          const videoUrlUploaded = await uploadToFirebase(
            file,
            auth.currentUser?.uid,
            (p) => setUploadProgress(p),
            "videos"
          );
          const duration = await getVideoDuration(file);

          let thumbnailUrl = post.video?.thumbnail || "";
          if (values.thumbnail?.[0]?.originFileObj) {
            thumbnailUrl = await uploadToFirebase(
              values.thumbnail[0].originFileObj,
              auth.currentUser?.uid,
              null,
              "videos"
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
        }
      }

      // ----- URL -----
      else if (useUrl && mediaUrl) {
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
              : post.video?.thumbnail || "",
            duration: meta?.duration || post.video?.duration || 0,
          };
          type = "video";
        }
      }

      payload.type = type;

      await onUpdate(payload).unwrap();
      handleSuccess("Post updated!");
      setIsUploading(false);
      setUploadProgress(0);
      setIsChanged(false);
      if (onClose) onClose();
    } catch (err) {
      console.error("Update post error:", err);
      handleError(err, "Failed to update post");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Render ---
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
    >
      {/* Content */}
      <Form.Item
        label="Edit Post"
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

        {/* Upload */}
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

        {/* URL */}
        {useUrl && (
          <Form.Item name="mediaUrl">
            <Input
              prefix={<LinkOutlined />}
              placeholder="Paste image / video URL"
            />
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

      {/* Media Preview */}
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

      {/* Submit button */}
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={isUploading || loading}
        disabled={!isChanged}
      >
        {isUploading
          ? uploadProgress < 100
            ? `Uploading... ${Math.round(uploadProgress)}%`
            : "Finalizing..."
          : loading
          ? "Saving..."
          : "Save Changes"}
      </Button>
    </Form>
  );
}
