import { useState } from "react";
import { Form } from "antd";
import { handleError } from "../../../utils/handleMessage";

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

export default function PostForm({ onCreatePost, loading }) {
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

  // Submit handler
  const handleFinish = async (values) => {
    try {
      const payload = await buildPostPayload(values, {
        mediaFile,
        mediaUrls,
        thumbnailFile,
        ytMeta,
        setIsUploading,
        setUploadProgress,
      });
      if (!payload) return;

      await onCreatePost(payload);
      form.resetFields();
    } catch (err) {
      console.error("❌ Create post error:", err);
      handleError(err, "Failed to publish post");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Render ---
  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {/* Post text + category */}
      <PostContent label="Create a Post" />

      {/* Media input (upload or URLs) */}
      <MediaInput useUpload={useUpload} setUseUpload={setUseUpload} />

      {/* Video-specific fields (YouTube/video upload) */}
      {(isVideoFile || isVideoUrl) && (
        <VideoFields isYouTubeUrl={isYouTubeUrl} useUpload={useUpload} />
      )}

      {/* Media preview (images or video thumbnail) */}
      <PreviewBox previewSrc={previewSrc} />

      {/* Submit button with progress */}
      <SubmitButton
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        loading={loading}
        isEdit={false} // differentiate from EditPostForm
      />
    </Form>
  );
}
