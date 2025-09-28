import { useState, useEffect } from "react";
import { Form } from "antd";

// --- Firebase ---
import { auth } from "../../../firebase";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";

// --- Utils ---
import { getVideoDuration } from "../../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../../utils/fetchYouTubeMetadata";
import { handleError, handleSuccess } from "../../../utils/handleMessage";

// --- Reusable Components ---
import PostContent from "./PostContent";
import MediaInput from "./MediaInput";
import VideoFields from "./VideoFields";
import PreviewBox from "./PreviewBox";
import SubmitButton from "./SubmitButton";

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

  // --- Toggle state (URL vs Upload) ---
  const [useUpload, setUseUpload] = useState(
    !(post?.image?.startsWith("http") || post?.video?.url?.startsWith("http"))
  );

  // --- Watch fields ---
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrl = Form.useWatch("mediaUrl", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  const [ytMeta, setYtMeta] = useState(null);

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

  // --- Initial values ---
  const initialValues = {
    content: post?.content,
    category: post?.category,
    title: post?.video?.title,
    mediaUrl: post?.video?.url || post?.image || "",
  };

  useEffect(() => {
    if (open && post) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  // Track changes
  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) => allValues[key] !== initialValues[key]
    );
    setIsChanged(changed);
  };

  // Preview setup
  useEffect(() => {
    let url;
    let isBlob = false;

    if (mediaFile?.[0]?.originFileObj?.type?.startsWith("image/")) {
      url = URL.createObjectURL(mediaFile[0].originFileObj);
      isBlob = true;
    } else if (thumbnailFile?.[0]?.originFileObj) {
      url = URL.createObjectURL(thumbnailFile[0].originFileObj);
      isBlob = true;
    } else if (post?.video?.thumbnail) {
      url = post.video.thumbnail;
    } else if (post?.image) {
      url = post.image;
    } else if (isImageUrl && !isVideoUrl) {
      url = mediaUrl;
    } else if (isYouTubeUrl && ytMeta?.thumbnail) {
      url = ytMeta.thumbnail;
    }

    setPreviewSrc(url);
    return () => {
      if (isBlob && url?.startsWith("blob:")) URL.revokeObjectURL(url);
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

  // YouTube metadata
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

    if (isYouTubeUrl) getMeta();
    else setYtMeta(null);

    return () => {
      cancelled = true;
    };
  }, [mediaUrl, isYouTubeUrl, form]);

  const handleFinish = async (values) => {
    try {
      let payload = {
        id: post._id,
        category: values.category,
        content: values.content,
      };
      let type = "text";

      // File path
      if (!useUpload && mediaFile?.[0]?.originFileObj) {
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

      // URL path
      else if (useUpload && mediaUrl) {
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

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
    >
      <PostContent label="Edit Post" />
      <MediaInput useUpload={useUpload} setUseUpload={setUseUpload} />
      {(isVideoFile || isVideoUrl) && (
        <VideoFields isYouTubeUrl={isYouTubeUrl} useUpload={useUpload} />
      )}
      <PreviewBox previewSrc={previewSrc} />
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
