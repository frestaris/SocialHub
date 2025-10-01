import { uploadToFirebase } from "./uploadToFirebase";
import { getVideoDuration } from "./getVideoDuration";
import { fetchYouTubeMetadata } from "./fetchYouTubeMetadata";
import { auth } from "../firebase";
import { handleError } from "./handleMessage";

/**
 * Build a normalized post payload before sending to backend
 * Handles:
 * - File uploads (images, videos, thumbnails)
 * - Remote URLs (images, YouTube)
 * - Type detection ("text", "image", "video")
 */

const MAX_ITEMS = 5;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]; // tweak as you like

export async function buildPostPayload(values, options, postId = null) {
  const {
    mediaFile,
    mediaUrls,
    thumbnailFile,
    ytMeta,
    setIsUploading,
    setUploadProgress,
  } = options;

  // --- Base payload ---
  let payload = {
    ...(postId && { id: postId }), // include id if editing
    category: values.category,
    content: values.content,
  };

  let type = "text"; // default post type

  // ---- CASE 1: Local file uploads ----
  if (mediaFile?.length > 0) {
    // enforce max uploads
    if (mediaFile.length > MAX_ITEMS) {
      handleError(
        `You can only upload up to ${MAX_ITEMS} files.`,
        "Upload limit reached"
      );
      return null;
    }

    const firstFile = mediaFile[0].originFileObj;

    // --- Image upload ---
    if (firstFile.type.startsWith("image/")) {
      setIsUploading?.(true);
      const uploadedUrls = [];

      const total = mediaFile.length;
      let completed = 0;

      for (let f of mediaFile) {
        const fileObj = f.originFileObj;

        // Fast-fail 4 MB guard (uploadToFirebase also checks)
        if (fileObj.size > 4 * 1024 * 1024) {
          handleError({
            message: `Each image must be ≤ 4 MB. "${fileObj.name}" is too large.`,
          });
          return null;
        }

        const url = await uploadToFirebase(
          fileObj,
          auth.currentUser?.uid,
          (p) => {
            if (setUploadProgress) {
              // track per-file progress and compute overall
              const fileProgress = p / 100;
              const overall = ((completed + fileProgress) / total) * 100;
              setUploadProgress(overall);
            }
          },
          "posts",
          false,
          { maxMB: 4, allowedTypes: IMG_TYPES }
        );

        uploadedUrls.push(url);
        completed += 1;
        setUploadProgress?.((completed / total) * 100);
      }

      payload.images = uploadedUrls;
      type = "image";
    }

    // --- Video upload ---
    else if (firstFile.type.startsWith("video/")) {
      if (firstFile.size > 4 * 1024 * 1024) {
        handleError({
          message: "Videos must be ≤ 4 MB or use a YouTube link instead.",
        });
        return null;
      }

      setIsUploading?.(true);

      // Upload video file
      const videoUrl = await uploadToFirebase(
        firstFile,
        auth.currentUser?.uid,
        (p) => setUploadProgress?.(p),
        "videos",
        false,
        { maxMB: 4 }
      );

      // Extract duration client-side
      const duration = await getVideoDuration(firstFile);

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailFile?.[0]?.originFileObj) {
        const thumbObj = thumbnailFile[0].originFileObj;
        if (thumbObj.size > 4 * 1024 * 1024) {
          handleError({ message: "Thumbnail must be ≤ 4 MB." });
          return null;
        }
        thumbnailUrl = await uploadToFirebase(
          thumbObj,
          auth.currentUser?.uid,
          null,
          "videos",
          true,
          { maxMB: 4, allowedTypes: IMG_TYPES }
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
  } else if (mediaUrls?.length > 0) {
    /**
     * --- CASE 2: URLs ---
     * Handle YouTube videos or external image URLs
     */
    const cleanUrls = mediaUrls.map((u) => u?.trim()).filter(Boolean);

    // enforce max URLs
    if (cleanUrls.length > MAX_ITEMS) {
      handleError(
        `You can only add up to ${MAX_ITEMS} URLs.`,
        "Link limit reached"
      );
      return null;
    }

    const youtubeUrls = cleanUrls.filter(
      (u) => u.includes("youtube.com") || u.includes("youtu.be")
    );
    const imageUrls = cleanUrls.filter((u) => !youtubeUrls.includes(u));

    // --- Safety: allow only one YouTube URL ---
    if (youtubeUrls.length > 1) {
      handleError("Only one YouTube video URL is allowed.", "Invalid links");
      return null;
    }

    // --- YouTube video ---
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

    // --- External images ---
    if (imageUrls.length > 0) {
      payload.images = imageUrls;
      if (!type || type === "text") type = "image";
    }
  }

  // --- Finalize ---
  payload.type = type;
  return payload;
}
