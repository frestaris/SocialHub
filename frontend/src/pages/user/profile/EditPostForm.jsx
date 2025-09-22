import { Form, Input, Button, Select, Upload as AntUpload, Switch } from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";
import { getVideoDuration } from "../../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../../utils/fetchYouTubeMetadata";
import { auth } from "../../../firebase";
import { categories } from "../../../utils/categories";
import { handleError, handleSuccess } from "../../../utils/handleMessage";

const { TextArea } = Input;

export default function EditPostForm({
  post,
  open,
  onClose,
  onUpdate,
  loading,
}) {
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChanged, setIsChanged] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  // toggle state
  const [useUrl, setUseUrl] = useState(
    post?.image?.startsWith("http") || post?.video?.url?.startsWith("http")
  );

  // Watch fields
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrl = Form.useWatch("mediaUrl", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // YouTube metadata
  const [ytMeta, setYtMeta] = useState(null);

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

  // Prefill values when editing
  const initialValues = {
    content: post?.content,
    category: post?.category,
    title: post?.video?.title,
    mediaUrl: post?.video?.url || post?.image || "",
  };

  useEffect(() => {
    if (!isYouTubeUrl && !useUrl) {
      // 👇 remove stale YouTube thumbnail + title when switching to upload mode
      form.setFieldsValue({
        thumbnail: [],
        title: form.getFieldValue("title") || "", // keep if user typed manually
      });
    }
  }, [isYouTubeUrl, useUrl, form]);

  useEffect(() => {
    // If switching to an image (either file or URL),
    // remove leftover video fields like thumbnail + title
    if (
      isImageUrl ||
      mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")
    ) {
      form.setFieldsValue({
        thumbnail: [],
        title: "",
      });
    }
  }, [isImageUrl, mediaFile, form]);

  useEffect(() => {
    if (open && post) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  useEffect(() => {
    let url;
    let isBlob = false;

    if (mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")) {
      // 🖼️ New uploaded image
      url = URL.createObjectURL(mediaFile[0].originFileObj);
      isBlob = true;
    } else if (thumbnailFile?.[0]?.originFileObj) {
      // 🎞️ New uploaded video thumbnail
      url = URL.createObjectURL(thumbnailFile[0].originFileObj);
      isBlob = true;
    } else if (post?.video?.thumbnail) {
      // 📂 Existing saved video thumbnail from DB
      url = post.video.thumbnail;
    } else if (post?.image) {
      // 📂 Existing saved image from DB
      url = post.image;
    } else if (isImageUrl && !isVideoUrl) {
      // 🌐 Direct image URL (but not video URL!)
      url = mediaUrl;
    } else if (isYouTubeUrl && ytMeta?.thumbnail) {
      // ▶️ YouTube metadata thumbnail
      url = ytMeta.thumbnail;
    }

    setPreviewSrc(url);

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

  // Fetch YouTube metadata
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

  // Track if form is changed
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
      setIsChanged(false); // reset
      if (onClose) onClose();
    } catch (err) {
      console.error("Update post error:", err);
      handleError(err, "Failed to update post");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label="Edit Post"
        name="content"
        rules={[{ required: true, message: "Content is required" }]}
      >
        <TextArea rows={3} placeholder="What's on your mind?" />
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

      {/* Media Preview (Feed-style) */}
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
