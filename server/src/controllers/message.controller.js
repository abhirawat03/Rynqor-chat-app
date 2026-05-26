import { getMessageService } from "../services/message.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadMessageMedia =
    async (req, res) => {

        const files =
            req.files || [];

        if (
            files.length === 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "No files uploaded",
                });
        }

        const media =
            await Promise.all(

                files.map(
                    async (file) => {

                        const uploaded =
                            await uploadOnCloudinary(
                                file.path,
                                "Rynqor/messages",
                                file.mimetype
                            );

                        let type =
                            "file";

                        if (
                            file.mimetype.startsWith(
                                "image"
                            )
                        ) {

                            type =
                                "image";

                        } else if (
                            file.mimetype.startsWith(
                                "video"
                            )
                        ) {

                            type =
                                "video";

                        } else if (
                            file.mimetype.startsWith(
                                "audio"
                            )
                        ) {

                            type =
                                "audio";
                        }

                        return {

                            url:
                                uploaded.url,

                            publicId:
                                uploaded.publicId,

                            type,

                            name:
                                file.originalname,

                            size:
                                file.size,
                        };
                    }
                )
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    media,
                    "Media uploaded successfully"
                )
            );
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