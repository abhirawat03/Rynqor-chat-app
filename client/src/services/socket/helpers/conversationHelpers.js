export const sortConversations = (list) => {

        return [...list].sort(
            (a, b) =>
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
        );
    };

export const updateConversationLastMessage = ({
    setConversations,
    conversationId,
    msg,
}) => {
    console.log(
    "UPDATE_CONVERSATION",
    {
        conversationId,
        text: msg.text,
        id: msg._id,
        clientTempId: msg.clientTempId,
    }
);

    const timestamp =
        msg.createdAt ||
        new Date().toISOString();

    setConversations(prev => {

        const index =
            prev.findIndex(
                conv =>
                    String(conv._id) ===
                    String(conversationId)
            );

        if (index === -1) {

            return [
                {
                    _id: conversationId,
                    lastMessage: msg,
                    updatedAt: timestamp,
                },
                ...prev,
            ];
        }

        const conversation =
            prev[index];

        const updatedConversation = {
            ...conversation,
            lastMessage: msg,
            updatedAt: timestamp,
        };

        return [
            updatedConversation,
            ...prev.filter(
                (_, i) => i !== index
            ),
        ];
    });

    if (
        import.meta.env.MODE !==
        "production"
    ) {
        console.log(
            "CONVERSATION UPDATE"
        );
    }
};