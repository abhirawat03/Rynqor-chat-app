import axios from "axios";
import Api from "./api.js";

const getMessage = async (conversationId, cursor = null) => {
  const params = new URLSearchParams();

  // pagination cursor
  if (cursor) {
    params.append("cursor", cursor);
  }
  const res = await Api.get(`/messages/${conversationId}?${params.toString()}`);
  return res.data.data;
};

const uploadMessageMedia = async ({ files, onUploadProgress }) => {
  // 1. Fetch secure signature from application server
  const { data: response } = await Api.get("/messages/upload-signature");
  const { signature, timestamp, folder, apiKey, cloudName } = response;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const loadedBytes = new Array(files.length).fill(0);

  // 2. Perform direct parallel uploads to Cloudinary's API
  const uploadPromises = files.map((file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    return axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            loadedBytes[index] = progressEvent.loaded;
            const currentLoaded = loadedBytes.reduce((sum, val) => sum + val, 0);
            onUploadProgress({
              loaded: currentLoaded,
              total: totalSize,
            });
          }
        },
      }
    );
  });

  const results = await Promise.all(uploadPromises);

  // 3. Map Cloudinary responses to match MongoDB message media schema
  return results.map((res, index) => {
    const file = files[index];
    let type = "file";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    }

    return {
      url: res.data.secure_url,
      publicId: res.data.public_id,
      type,
      name: file.name,
      size: file.size,
    };
  });
};

export { getMessage, uploadMessageMedia };
