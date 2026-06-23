// import mongoose, {Schema} from "mongoose";

// const msgSchema = new Schema({
//     conversationId:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref:"Conversation",
//         required:true,
//         index:true
//     },
//     senderId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User",
//         required:true,
//     },
//     // type: {
//     //     type: String,
//     //     enum: ["text", "image", "file"],
//     //     default: "text",
//     // },
//     text: {
//         type: String,
//         trim: true,
//     },
//     // mediaUrl: {
//     //     type: String,
//     //     default: null,
//     // },
//     status: {
//         type: String,
//         enum: ["sent", "delivered", "read"],
//         default: "sent",
//     },
//     // seenBy: [{
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "User"
//     // }]
// },{timestamps:true})

// msgSchema.index({ conversationId: 1, _id: -1 });

// export const Message = mongoose.model("Message",msgSchema)


import mongoose, { Schema } from "mongoose";

const mediaSchema =
    new Schema({
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "image",
                "video",
                "file",
                "audio",
            ],
            required: true,
        },

        name: {
            type: String,
        },

        size: {
            type: Number,
        },
    });

const msgSchema =
    new Schema(
        {
            conversationId: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "Conversation",
                required: true,
                index: true,
            },

            senderId: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "User",
                required: true,
            },

            text: {
                type: String,
                trim: true,
                default: "",
            },

            messageType: {
    type: String,
    enum: [
        "text",
        "media",
        "mixed",
    ],
    default: "text"
},

            media: [
                mediaSchema,
            ],

            status: {
                type: String,
                enum: [
                    "sent",
                    "read",
                ],
                default: "sent",
            },
        },
        {
            timestamps: true,
        }
    );

msgSchema.index({
    conversationId: 1,
    _id: -1,
});

msgSchema.index({
    conversationId: 1,
    senderId: 1,
    status: 1,
});

// msgSchema.index({
//     conversationId: 1,
//     createdAt: -1,
// })

export const Message =
    mongoose.model(
        "Message",
        msgSchema
    );