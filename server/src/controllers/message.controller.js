import { getMessageService } from "../services/message.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";


const getMessage = async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;
  const { cursor } = req.query;

  const message = await getMessageService(userId, conversationId, cursor);
  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message fetched successfully"));
};

const getUploadSignature = async (req, res) => {
  const { type } = req.query;
  const folder = type === "avatar" || type === "avatars" ? "Rynqor/avatar" : "Rynqor/messages";
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return res.status(200).json({
    success: true,
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};

export { getMessage, getUploadSignature };
