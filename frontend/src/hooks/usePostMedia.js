import { useState, useEffect, useMemo } from "react";
import { Form } from "antd";
import { fetchYouTubeMetadata } from "../utils/posts/fetchYouTubeMetadata";

/**
 * Hook to manage post media inputs.
 * - Watches AntD form fields (mediaFile, mediaUrls, thumbnail)
 * - Normalizes mediaUrls (always an array, never undefined)
 * - Prevents upload + URLs being active at the same time
 * - Fetches YouTube metadata (title + thumbnail)
 * - Builds previewSrc (local blobs + remote URLs)
 */
export default function usePostMedia(form) {
  const [ytMeta, setYtMeta] = useState(null);
  const [previewSrc, setPreviewSrc] = useState([]);

  // --- Watch form fields ---
  const mediaFile = Form.useWatch("mediaFile", form);
  const rawMediaUrls = Form.useWatch("mediaUrls", form);
  const thumbnailFile = Form.useWatch("thumbnail", form);

  // Memoize to avoid new [] reference every render
  const mediaUrls = useMemo(() => rawMediaUrls || [], [rawMediaUrls]);

  // --- Derived booleans ---
  const isVideoFile = mediaFile?.[0]?.originFileObj?.type?.startsWith("video/");
  const isYouTubeUrl = mediaUrls.some(
    (u) => u?.includes("youtube.com") || u?.includes("youtu.be")
  );
  const isVideoUrl = mediaUrls.some(
    (u) =>
      u?.endsWith(".mp4") ||
      u?.endsWith(".webm") ||
      u?.endsWith(".mov") ||
      u?.includes("youtube.com") ||
      u?.includes("youtu.be")
  );

  // --- Ensure only one input active ---
  useEffect(() => {
    if (mediaFile?.length > 0 && mediaUrls?.length > 0) {
      form.setFieldsValue({ mediaUrls: [] });
    }
    if (mediaUrls?.length > 0 && mediaFile?.length > 0) {
      form.setFieldsValue({ mediaFile: [] });
    }
  }, [mediaFile, mediaUrls, form]);

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

    const ytUrl = mediaUrls.find(
      (u) => u && (u.includes("youtube.com") || u.includes("youtu.be"))
    );
    if (ytUrl) getMeta(ytUrl);
    else setYtMeta(null);

    return () => {
      cancelled = true;
    };
  }, [mediaUrls, form]);

  // --- Build previewSrc (local blobs or URLs) ---
  useEffect(() => {
    let urls = [];

    if (mediaFile?.length > 0) {
      if (mediaFile[0].originFileObj.type.startsWith("image/")) {
        urls = mediaFile.map((f) => URL.createObjectURL(f.originFileObj));
      } else if (thumbnailFile?.[0]?.originFileObj) {
        urls = [URL.createObjectURL(thumbnailFile[0].originFileObj)];
      }
    } else if (mediaUrls.length > 0) {
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

  return {
    mediaFile,
    mediaUrls,
    thumbnailFile,
    ytMeta,
    previewSrc,
    isVideoFile,
    isYouTubeUrl,
    isVideoUrl,
  };
}
