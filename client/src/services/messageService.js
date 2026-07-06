import Api from "./api.js";
import { uploadSingleToCloud } from "./uploadService.js";

const getMessage = async (conversationId, cursor = null) => {
  const res = await Api.get(`/messages/${conversationId}`, {
    params: cursor ? { cursor } : undefined,
  });
  return res.data.data;
};

const uploadMessageMedia = async ({ files, onUploadProgress }) => {
  // 1. Fetch secure signature from application server once
  const { data: response } = await Api.get("/messages/upload-signature");

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSizes = new Array(files.length).fill(0);
  const loadedBytes = new Array(files.length).fill(0);

  // 2. Perform direct parallel uploads using the reusable helper!
  const uploadPromises = files.map((file, index) => {
    return uploadSingleToCloud(file, "message", {
      credentials: response,
      onProgress: (progressEvent) => {
        if (onUploadProgress) {
          loadedBytes[index] = progressEvent.loaded;
          totalSizes[index] = progressEvent.total;

          const currentLoaded = loadedBytes.reduce((sum, val) => sum + val, 0);
          // Fall back to raw file size sum if some requests have not started/resolved total bytes yet
          const currentTotal =
            totalSizes.reduce((sum, val) => sum + val, 0) || totalSize;

          onUploadProgress({
            loaded: currentLoaded,
            total: currentTotal,
          });
        }
      },
    });
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
      url: res.url,
      publicId: res.publicId,
      type,
      name: file.name,
      size: file.size,
    };
  });
};

export { getMessage, uploadMessageMedia };
