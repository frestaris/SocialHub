import { useState, useEffect } from "react";
import { Form } from "antd";

// --- Firebase ---
import { auth } from "../../../firebase";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";

// --- Utils ---
import { getVideoDuration } from "../../../utils/getVideoDuration";
import { fetchYouTubeMetadata } from "../../../utils/fetchYouTubeMetadata";
import { handleError } from "../../../utils/handleMessage";

// --- Reusable Components ---
import PostContent from "./PostContent";
import MediaInput from "./MediaInput";
import VideoFields from "./VideoFields";
import PreviewBox from "./PreviewBox";
import SubmitButton from "./SubmitButton";

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
  const mediaUrls = Form.useWatch("mediaUrls", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // --- Derived booleans ---
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

  // --- Fetch YouTube metadata ---
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

    // Local file previews
    if (mediaFile?.length > 0) {
      if (mediaFile[0].originFileObj.type.startsWith("image/")) {
        urls = mediaFile.map((f) => URL.createObjectURL(f.originFileObj));
      } else if (thumbnailFile?.[0]?.originFileObj) {
        urls = [URL.createObjectURL(thumbnailFile[0].originFileObj)];
      }
    }
    // URL previews
    else if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
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

  // --- Keep only one input active ---
  useEffect(() => {
    if (mediaFile?.length > 0 && mediaUrls?.length > 0) {
      form.setFieldsValue({ mediaUrls: [] });
    }
    if (mediaUrls?.length > 0 && mediaFile?.length > 0) {
      form.setFieldsValue({ mediaFile: [] });
    }
  }, [mediaFile, mediaUrls, form]);

  // --- Submit handler ---
  const handleFinish = async (values) => {
    try {
      let payload = { category: values.category, content: values.content };
      let type = "text";

      // --- File upload path ---
      if (mediaFile?.length > 0) {
        const firstFile = mediaFile[0].originFileObj;

        if (firstFile.type.startsWith("image/")) {
          setIsUploading(true);
          const uploadedUrls = [];

          const total = mediaFile.length;
          let completed = 0;

          for (let f of mediaFile) {
            const url = await uploadToFirebase(
              f.originFileObj,
              auth.currentUser?.uid,
              (p) => {
                const fileProgress = p / 100;
                const overall = ((completed + fileProgress) / total) * 100;
                setUploadProgress(overall);
              },
              "posts"
            );

            uploadedUrls.push(url);
            completed += 1;
            setUploadProgress((completed / total) * 100);
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

      // --- URL path ---
      else if (values.mediaUrls?.length > 0) {
        const urls = values.mediaUrls.map((u) => u.trim()).filter(Boolean);

        const youtubeUrls = urls.filter(
          (u) => u.includes("youtube.com") || u.includes("youtu.be")
        );
        const imageUrls = urls.filter((u) => !youtubeUrls.includes(u));

        if (youtubeUrls.length > 1) {
          throw new Error("Only one YouTube video URL is allowed.");
        }

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

      await onCreatePost(payload);
      form.resetFields();
      setYtMeta(null);
      setPreviewSrc(null);
    } catch (err) {
      console.error("❌ Create post error:", err);
      handleError(err, "Failed to publish post");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <PostContent label="Create a Post" />
      <MediaInput useUpload={useUpload} setUseUpload={setUseUpload} />
      {(isVideoFile || isVideoUrl) && (
        <VideoFields isYouTubeUrl={isYouTubeUrl} useUpload={useUpload} />
      )}
      <PreviewBox previewSrc={previewSrc} />
      <SubmitButton
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        loading={loading}
        isEdit={false}
      />
    </Form>
  );
}
