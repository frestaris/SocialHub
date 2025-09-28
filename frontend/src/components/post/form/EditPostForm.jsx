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

  const [useUpload, setUseUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChanged, setIsChanged] = useState(false);
  const [ytMeta, setYtMeta] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  // --- Watch fields ---
  const mediaFile = Form.useWatch("mediaFile", form);
  const mediaUrls = Form.useWatch("mediaUrls", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  const isVideoFile = mediaFile?.[0]?.originFileObj?.type?.startsWith("video/");
  const isYouTubeUrl =
    Array.isArray(mediaUrls) &&
    mediaUrls.some(
      (u) => u?.includes("youtube.com") || u?.includes("youtu.be")
    );
  const isVideoUrl =
    Array.isArray(mediaUrls) &&
    mediaUrls.some(
      (u) =>
        u?.endsWith(".mp4") ||
        u?.endsWith(".webm") ||
        u?.endsWith(".mov") ||
        u?.includes("youtube.com") ||
        u?.includes("youtu.be")
    );

  // --- Initial values ---
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

  useEffect(() => {
    if (open && post) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  // Track changes
  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) =>
        JSON.stringify(allValues[key]) !== JSON.stringify(initialValues[key])
    );
    setIsChanged(changed);
  };

  // YouTube metadata
  useEffect(() => {
    let cancelled = false;
    const getMeta = async (url) => {
      try {
        const meta = await fetchYouTubeMetadata(url);
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

    if (Array.isArray(mediaUrls)) {
      const ytUrl = mediaUrls.find(
        (u) => u && (u.includes("youtube.com") || u.includes("youtu.be"))
      );
      if (ytUrl) getMeta(ytUrl);
      else setYtMeta(null);
    }

    return () => {
      cancelled = true;
    };
  }, [mediaUrls, form]);

  // --- Preview handling ---
  useEffect(() => {
    let urls = [];

    if (mediaFile?.length > 0) {
      if (mediaFile[0].originFileObj.type.startsWith("image/")) {
        urls = mediaFile.map((f) => URL.createObjectURL(f.originFileObj));
      } else if (thumbnailFile?.[0]?.originFileObj) {
        urls = [URL.createObjectURL(thumbnailFile[0].originFileObj)];
      }
    } else if (Array.isArray(mediaUrls)) {
      const cleanUrls = mediaUrls.map((u) => u?.trim()).filter(Boolean);
      const youtubeUrl = cleanUrls.find(
        (u) => u.includes("youtube.com") || u.includes("youtu.be")
      );
      const imageUrls = cleanUrls.filter(
        (u) => !u.includes("youtube.com") && !u.includes("youtu.be")
      );

      if (youtubeUrl && ytMeta?.thumbnail) {
        urls.push(ytMeta.thumbnail);
      }
      if (imageUrls.length > 0) {
        urls = [...urls, ...imageUrls];
      }
    }

    setPreviewSrc(urls);

    return () => {
      urls.forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, [mediaFile, mediaUrls, thumbnailFile, ytMeta]);

  // --- Submit handler ---
  const handleFinish = async (values) => {
    try {
      let payload = {
        id: post._id,
        category: values.category,
        content: values.content,
      };
      let type = "text";

      // File upload path
      if (mediaFile?.length > 0) {
        const firstFile = mediaFile[0].originFileObj;

        if (firstFile.type.startsWith("image/")) {
          setIsUploading(true);
          const uploadedUrls = [];

          for (let f of mediaFile) {
            const url = await uploadToFirebase(
              f.originFileObj,
              auth.currentUser?.uid,
              null,
              "posts"
            );
            uploadedUrls.push(url);
          }

          payload.images = uploadedUrls;
          type = "image";
        } else if (firstFile.type.startsWith("video/")) {
          setIsUploading(true);
          const videoUrl = await uploadToFirebase(
            firstFile,
            auth.currentUser?.uid,
            (p) => setUploadProgress(p),
            "videos"
          );
          const duration = await getVideoDuration(firstFile);

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

      // URL path
      else if (values.mediaUrls?.length > 0) {
        const urls = values.mediaUrls.map((u) => u.trim()).filter(Boolean);
        const youtubeUrls = urls.filter(
          (u) => u.includes("youtube.com") || u.includes("youtu.be")
        );
        const imageUrls = urls.filter((u) => !youtubeUrls.includes(u));

        if (youtubeUrls.length > 1)
          throw new Error("Only one YouTube video URL is allowed.");

        if (youtubeUrls.length === 1) {
          const ytUrl = youtubeUrls[0];
          const meta =
            ytMeta || (await fetchYouTubeMetadata(ytUrl).catch(() => null));

          payload.video = {
            title: values.title || meta?.title || "",
            category: values.category,
            url: ytUrl,
            thumbnail: meta?.thumbnail || "",
            duration: meta?.duration || 0,
          };
          type = "video";
        }

        if (imageUrls.length > 0) {
          payload.images = imageUrls;
          if (!type || type === "text") type = "image";
        }
      }

      payload.type = type;

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
