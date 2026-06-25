import { createConversationService, getConversationByIdService, getConversationMediaService, getConversationService, createGroupConversationService } from "../services/conversation.service.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const createConversation = async (req, res) => {
    const userId = req.user?._id;
    const {receiverId} = req.body;

    const conversation = await createConversationService(userId, receiverId);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                conversation,
                "Conversation created successfully"
            )
        )
}

const getConversation = async (req, res) => {
    const userId = req.user?._id;
    // const {cursor} = req.query;

    const conversations = await getConversationService(userId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                conversations,
                "Conversations fetched successfully"
            )
        )
}

const getConversationById = async (req, res) => {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await getConversationByIdService(
        userId,
        conversationId
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            conversation,
            "Conversation fetched by Id successfully"
        )
    );
};

const getConversationMedia = async (
    req,
    res
) => {

    const userId =
        req.user._id;

    const { conversationId } =
        req.params;

    const media =
        await getConversationMediaService(
            userId,
            conversationId,
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                media,
                "Conversation media fetched successfully"
            )
        );
};

const createGroupConversation = async (req, res) => {
    const userId = req.user?._id;
    const { name, participants, avatar } = req.body;

    const conversation = await createGroupConversationService(userId, name, participants, avatar);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                conversation,
                "Group conversation created successfully"
            )
        );
};

export { createConversation, getConversation, getConversationById, getConversationMedia, createGroupConversation };