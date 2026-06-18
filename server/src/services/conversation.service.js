import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatName } from "../utils/format.js";
import { Message } from "../models/message.model.js";

const USER_PUBLIC_FIELDS =
    "_id username fullName avatar";
const createConversationService = async (userId, receiverId) => {
    const isSelfChat = userId.toString() === receiverId.toString();
    // if(userId === receiverId) throw new ApiError(400, "Cannot chat with yourself");

    let conversation;

    if (isSelfChat) {
        conversation = await Conversation.findOne({
            participants: userId,
            type: "self"
        }).populate("participants", USER_PUBLIC_FIELDS);

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId],
                type: "self",
            });
            await conversation.populate("participants", USER_PUBLIC_FIELDS);
        }

        const user = conversation.participants[0];

        return {
            _id: conversation._id,
            name: `${formatName(user.fullName)} (You)`,
            avatar: user.avatar || null,
        };
    }

    conversation = await Conversation.findOne({
        participants: { $all: [userId, receiverId] },
        type: "direct",
        $expr: { $eq: [{ $size: "$participants" }, 2] },
    }).populate("participants", USER_PUBLIC_FIELDS);

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, receiverId],
            type: "direct",
        })
        await conversation.populate("participants", USER_PUBLIC_FIELDS);
    }

    const otherUser = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
    );

    const result = {
        _id: conversation._id,
        name: formatName(otherUser?.fullName || ""),
        avatar: otherUser?.avatar || null,
    }

    return result;
};

const getConversationService = async (userId) => {
    // const PAGE_SIZE = 20;

    // const query = {
    //     participants: userId,
    // }

    // if (cursor) {
    //     query.updatedAt = {
    //         $lt: new Date(cursor),
    //     };
    // }
    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate("participants", USER_PUBLIC_FIELDS)
        .populate({
            path: "lastMessage",
            populate: {
                path: "senderId",
                select: "fullName username avatar",
            },
        })
        .sort({ updatedAt: -1 })
        // .limit(PAGE_SIZE + 1)
        .lean();
    
    // const hasMore =
    //     conversations.length >
    //     PAGE_SIZE;

    // if (hasMore) {
    //     conversations.pop();
    // }

    const result = conversations.map((conv) => {
        const isSelf = conv.type === "self";

        if (isSelf) {
            const user = conv.participants[0];

            return {
                _id: conv._id,
                name: `${formatName(user.fullName)} (You)`,
                avatar: user.avatar || null,
                participants: conv.participants,
                lastMessage: conv.lastMessage || null,
                updatedAt: conv.updatedAt,
            };
        }

        const otherUser = conv.participants.find(
            (p) => p._id.toString() !== userId.toString()
        );

        return {
            _id: conv._id,
            name: formatName(otherUser?.fullName || ""),
            avatar: otherUser?.avatar || null,
            participants: conv.participants,
            lastMessage: conv.lastMessage || null,
            updatedAt: conv.updatedAt,
        };
    });

    // const nextCursor =
    //     conversations.length > 0
    //         ? conversations[
    //             conversations.length -1
    //         ].updatedAt
    //         : null;
    
    // return {
    //     conversations: result,
    //     nextCursor,
    //     hasMore,
    // };

    return result;
};

const getConversationByIdService = async (userId, conversationId) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    }).populate("participants", USER_PUBLIC_FIELDS);

    if (!conversation) {
        throw new ApiError(403, "Not allowed or conversation not found");
    }

    const isSelf = conversation.type === "self";

    if (isSelf) {
        const user = conversation.participants[0];

        return {
            _id: conversation._id,
            name: `${formatName(user.fullName)} (You)`,
            avatar: user.avatar || null,
            participants: conversation.participants,
            type: conversation.type,
        };
    }

    const otherUser = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
    );

    return {
        _id: conversation._id,
        name: formatName(otherUser?.fullName || ""),
        avatar: otherUser?.avatar || null,
        participants: conversation.participants,
        type: conversation.type,
    };
};

const getConversationMediaService =
    async (
        userId,
        conversationId,
    ) => {

    // VERIFY USER BELONGS
    await getConversationByIdService(
        userId,
        conversationId
    );

    // FETCH MEDIA
    return await Message.find({
            conversationId,

            messageType: {
                $in: [
                    "media",
                    "mixed",
                ],
            },
    })
        .populate(
            "senderId",
            USER_PUBLIC_FIELDS
        )
        .sort({
            createdAt: -1,
        })
        .select(
            "_id text media messageType senderId createdAt"
        )

        .lean();

};

export {
    createConversationService,
    getConversationService,
    getConversationByIdService,
    getConversationMediaService
};
