import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (
  localFilePath,
  folder = "Rynqor/avatar",
  mimeType,
) => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    return {
      url: response.secure_url,
      publicId: response.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  } finally {
    await fs.unlink(localFilePath).catch(() => {});
  }
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary destroy failed for publicId:", publicId, error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
