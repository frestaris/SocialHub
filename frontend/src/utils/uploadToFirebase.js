import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadToFirebase = (
  file,
  userId,
  onProgress,
  folder = "videos",
  isThumbnail = false
) => {
  return new Promise((resolve, reject) => {
    try {
      // Store thumbnails inside the videos folder
      const baseFolder = folder === "thumbnails" ? "videos" : folder;

      // If it's a thumbnail, prepend "thumb_" to filename for clarity
      const fileName = `${isThumbnail ? "thumb_" : ""}${Date.now()}_${
        file.name
      }`;

      const filePath = `${baseFolder}/${userId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => reject(error),
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
