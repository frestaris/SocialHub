import { useState, useEffect } from "react";
import { Form } from "antd";
import { handleError, handleSuccess } from "../../../utils/handleMessage";

// --- Components ---
import PostContent from "./PostContent";
import MediaInput from "./MediaInput";
import VideoFields from "./VideoFields";
import PreviewBox from "./PreviewBox";
import SubmitButton from "./SubmitButton";

// --- Hook ---
import usePostMedia from "../../../hooks/usePostMedia";

// --- Utils ---
import { buildPostPayload } from "../../../utils/posts/buildPostPayload";

export default function EditPostForm({
  post,
  open,
  onClose,
  onUpdate,
  loading,
}) {
  // --- AntD Form instance ---
  const [form] = Form.useForm();

  // --- Media state (from custom hook) ---
  const {
    mediaFile,
    mediaUrls,
    thumbnailFile,
    ytMeta,
    previewSrc,
    isVideoFile,
    isYouTubeUrl,
    isVideoUrl,
  } = usePostMedia(form);

  // --- Local state ---
  const [useUpload, setUseUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChanged, setIsChanged] = useState(false);

  // --- Initial form values ---
  const initialValues = {
    content: post?.content,
    category: post?.category,
    title: post?.video?.title,
    mediaUrls: post?.video?.url
      ? [post.video.url]
      : Array.isArray(post?.images)
      ? post.images
      : [],
  };

  // Reset form values whenever modal opens with a new post
  useEffect(() => {
    if (open && post) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  // Detect changes
  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) =>
        JSON.stringify(allValues[key]) !== JSON.stringify(initialValues[key])
    );
    setIsChanged(changed);
  };

  // Submit handler
  const handleFinish = async (values) => {
    try {
      const payload = await buildPostPayload(
        values,
        {
          mediaFile,
          mediaUrls,
          thumbnailFile,
          ytMeta,
          setIsUploading,
          setUploadProgress,
        },
        post._id
      );

      await onUpdate(payload);
      handleSuccess("Post updated!");
      setIsChanged(false);
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Update post error:", err);
      handleError(err, "Failed to update post");
    } finally {
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
      {/* Post text + category */}
      <PostContent label="Edit Post" />

      {/* Media input (upload or URLs) */}
      <MediaInput useUpload={useUpload} setUseUpload={setUseUpload} />

      {/* Video-specific fields (YouTube/video upload) */}
      {(isVideoFile || isVideoUrl) && (
        <VideoFields isYouTubeUrl={isYouTubeUrl} useUpload={useUpload} />
      )}

      {/* Media preview (images or video thumbnail) */}
      <PreviewBox previewSrc={previewSrc} />

      {/* Submit button with progress & disable if unchanged */}
      <SubmitButton
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        loading={loading}
        isChanged={isChanged}
        isEdit
      />
    </Form>
  );
}
