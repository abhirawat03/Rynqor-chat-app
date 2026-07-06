import axios from "axios";
import Api from "./api.js";

export const uploadSingleToCloud = async (file, type = "avatar", options = {}) => {
  const { onProgress, credentials } = options;

  // 1. Fetch credentials (or use pre-fetched ones for batch uploads)
  let creds = credentials;
  if (!creds) {
    const { data: response } = await Api.get(`/messages/upload-signature?type=${type}`);
    creds = response;
  }
  const { signature, timestamp, folder, apiKey, cloudName } = creds;

  // 2. Build FormData package for Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  // 3. Post directly to Cloudinary's upload endpoint
  const resourceType = type === "avatar" ? "image" : "auto";
  const cloudinaryRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
    }
  );

  return {
    url: cloudinaryRes.data.secure_url,
    publicId: cloudinaryRes.data.public_id
  };
};
