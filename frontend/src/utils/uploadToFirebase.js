import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload a file to Firebase Storage with a 4 MB cap (default).
 * Pass a different limit via options.maxMB if needed.
 */
export const uploadToFirebase = (
  file,
  userId,
  onProgress,
  folder = "videos",
  isThumbnail = false,
  options = {}
) => {
  const { maxMB = 4, allowedTypes } = options;

  return new Promise((resolve, reject) => {
    try {
      if (!file || !userId) {
        const e = new Error("Missing file or user");
        e.code = "invalid-params";
        return reject(e);
      }

      // ---- 4 MB size guard ----
      const maxBytes = maxMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const e = new Error(
          `File too large. Max allowed is ${maxMB} MB (got ${(
            file.size / 1048576
          ).toFixed(2)} MB).`
        );
        e.code = "file-too-large";
        return reject(e);
      }

      // ---- Optional MIME type guard ----
      if (Array.isArray(allowedTypes) && allowedTypes.length > 0) {
        if (!allowedTypes.includes(file.type)) {
          const e = new Error(
            `Unsupported file type: ${file.type || "unknown"}`
          );
          e.code = "file-type-not-allowed";
          return reject(e);
        }
      }

      // Keep thumbnails under /videos as before
      const baseFolder = folder === "thumbnails" ? "videos" : folder;

      // Safer filename
      const safeName = (file.name || "file")
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");
      const fileName = `${
        isThumbnail ? "thumb_" : ""
      }${Date.now()}_${safeName}`;

      const filePath = `${baseFolder}/${userId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      const metadata = { contentType: file.type || undefined };
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          if (error?.code === "storage/quota-exceeded") {
            const e = new Error(
              "Upload blocked: free plan storage/bandwidth quota exceeded."
            );
            e.code = "quota-exceeded";
            return reject(e);
          }
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};
