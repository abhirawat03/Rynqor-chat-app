import Api from "./api.js";

const sendMessage = async (data) => {
    const res = await Api.post("/messages", data);
    return res.data.data;
}

const getMessage = async (conversationId, cursor = null) => {
    const params =
        new URLSearchParams();

    // pagination cursor
    if (cursor) {
        params.append(
            "cursor",
            cursor
        );
    }
    const res = await Api.get(`/messages/${conversationId}?${params.toString()}`);
    return res.data.data;
}

const uploadMessageMedia =
    async ({ files}) => {

        const formData =
            new FormData();

        files.forEach(
            (file) => {

                formData.append(
                    "media",
                    file
                );
            }
        );

        const res =
            await Api.post(
                "/messages/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },

                }
            );

        return res.data.data;
    };


export { sendMessage, getMessage, uploadMessageMedia };