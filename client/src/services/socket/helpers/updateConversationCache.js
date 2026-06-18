export const updateConversationCache = ({
    queryClient,
    conversationId,
    msg,
}) => {

    console.log(
        "CACHE UPDATE",
        conversationId,
        msg.text
    );

    queryClient.setQueryData(
    ["conversations"],
    (old = []) => {

        const existing =
            old.find(
                c =>
                    String(c._id) ===
                    String(conversationId)
            );

        if (!existing) {
            return old;
        }

        const updated = {
            ...existing,
            lastMessage: msg,
            updatedAt: msg.createdAt,
        };

        return [
            updated,
            ...old.filter(
                c =>
                    String(c._id) !==
                    String(conversationId)
            ),
        ];
    }
);
};