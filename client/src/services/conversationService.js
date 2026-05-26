import Api from "./api.js";

const createConversation = async(receiverId) =>{
    const res = await Api.post(`/conversations`, {
        receiverId
    });
	return res.data.data;
}
const getConversations = async () => {
    const res = await Api.get("/conversations");
    return res.data.data;
}

const getConversationById = async (conversationId) => {
    if (!conversationId) throw new Error("Missing conversationId");
    const res = await Api.get(`/conversations/${conversationId}`);
    return res.data.data;
}

const getConversationMedia = async (conversationId) => {
    if (!conversationId) throw new Error("Missing conversationId");
    const res = await Api.get(`/conversations/${conversationId}/media`);
    return res.data.data;
}

export {createConversation, getConversations, getConversationById, getConversationMedia};