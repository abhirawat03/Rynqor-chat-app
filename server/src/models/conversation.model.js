import mongoose, {Schema} from "mongoose"

const convoSchema = new Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }],
    type: {
        type: String,
        enum: ["direct", "self"],
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
        // text: String,
        // senderId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User",
        // },
        // createdAt: Date,
    }
},{timestamps:true})

convoSchema.index({ participants: 1 });

export const Conversation = mongoose.model("Conversation",convoSchema)