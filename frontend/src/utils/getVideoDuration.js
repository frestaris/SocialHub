export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.floor(video.duration)); // duration in seconds
      };

      video.onerror = (e) => {
        reject(new Error("Failed to load video metadata"));
      };

      video.src = URL.createObjectURL(file);
    } catch (err) {
      reject(err);
    }
  });
};
