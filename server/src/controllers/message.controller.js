import { getMessageService } from "../services/message.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const uploadMessageMedia =
  async (req, res) => {
    const files = req.files || [];
    console.log("Received files:", files);

    if (!files.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No files uploaded",
        });
    }

    const uploadedAssets = [];

    try {
      const media = [];

      for (const file of files) {
        console.log("Processing:", file.mimetype);

        const uploaded = await uploadOnCloudinary(
          file.path,
          "Rynqor/messages"
        );

        if (!uploaded?.publicId || !uploaded?.url) {
          throw new Error(`Upload failed for file: ${file.originalname}`);
        }

        uploadedAssets.push(uploaded.publicId);

        let type = "file";
        if (file.mimetype.startsWith("image/")) {
          type = "image";
        } else if (file.mimetype.startsWith("video/")) {
          type = "video";
        } else if (file.mimetype.startsWith("audio/")) {
          type = "audio";
        }

        media.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          type,
          name: file.originalname,
          size: file.size,
        });
      }

      return res
        .status(200)
        .json({
          success: true,
          data: media,
          message: "Media uploaded successfully",
        });

    } catch (error) {
      console.error("Upload Controller Error:", error);

      // Rollback: Delete any successfully uploaded files in this failed batch
      if (uploadedAssets.length > 0) {
        await Promise.all(
          uploadedAssets.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err) =>
              console.error(`Failed to clean up orphaned asset ${publicId}:`, err)
            )
          )
        );
      }

      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Upload failed",
        });
    }
  };

const getMessage = async(req, res) => {
    const userId = req.user?._id;
    const {conversationId} = req.params;
    const {cursor} = req.query;

    const message = await getMessageService(userId, conversationId, cursor);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            message,
            "Message fetched successfully"
        )
    )
}

export {uploadMessageMedia, getMessage}