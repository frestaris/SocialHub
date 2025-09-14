import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadToFirebase = (file, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = `videos/${userId}/${Date.now()}_${file.name}`;
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
