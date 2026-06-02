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
        msg
    }) => {

        setConversations((prev) => {

            let exists = false;

            const updated = prev.map(
                (conv) => {

                    if (
                        conv._id.toString() ===
                        conversationId.toString()
                    ) {

                        exists = true;

                        return {
                            ...conv,

                            lastMessage: msg,

                            updatedAt:
                                msg.createdAt,
                        };
                    }

                    return conv;
                }
            );

            if (!exists) {

                updated.unshift({
                    _id: conversationId,

                    lastMessage: msg,

                    updatedAt:
                        msg.createdAt,
                });
            }

            return sortConversations(
                updated
            );
        });
        console.log("CONVERSATION UPDATE");
    };