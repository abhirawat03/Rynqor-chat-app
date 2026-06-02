import { useEffect, useRef } from "react";

import { NavLink } from "react-router-dom";
import { IoMdChatbubbles } from "react-icons/io";

import ChatItem from "../../components/chat/ChatItem.jsx";

import { useConversationsQuery } from "../../hooks/conversations/useConversationsQuery.js";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useSocket } from "../../services/socket/useSocket.js";

const ChatsPage = () => {

    const {
        conversations,
        setInitialConversations,
        presence,
        typingUsers,
    } = useSocket();

    const {
        data,
        isLoading,
        isError,
    } = useConversationsQuery();

  useEffect(() => {
    if (
        !data ||
        conversations.length > 0
    ) {
        return;
    }

    setInitialConversations(data);
}, [
    data,
    conversations.length,
    setInitialConversations,
]);

    useEffect(() => {
    console.log("CHATS PAGE MOUNTED");
}, []);

console.log(
    "QUERY",
    isLoading,
    data?.length
);

    // ---------------------------------------------------
    // CURRENT USER
    // ---------------------------------------------------

    const {
        data: user,
        isLoading:
            userLoading,
    } =
        useCurrentUserQuery();

    const currentUserId =
        String(
            user?._id || ""
        );
useEffect(() => {
    console.log(
        "QUERY DATA",
        data?.map(c => ({
            id: c._id,
            updatedAt: c.updatedAt,
            lastMessage: c.lastMessage?._id,
        }))
    );
}, [data]);

useEffect(() => {
    console.log(
        "SOCKET STATE",
        conversations.map(c => ({
            id: c._id,
            updatedAt: c.updatedAt,
            lastMessage: c.lastMessage?._id,
        }))
    );
}, [conversations]);

// useEffect(() => {
//     if (!data) return;

//     setInitialConversations(data);
// }, [data, setInitialConversations]);
    // ---------------------------------------------------
    // LOADING
    // ---------------------------------------------------

    if (
        isLoading ||
        userLoading
    ) {

        return (
            <div
                className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                "
            >
                <p className="text-muted">
                    Loading chats...
                </p>
            </div>
        );
    }

    // ---------------------------------------------------
    // ERROR
    // ---------------------------------------------------

    if (isError) {

        return (
            <div
                className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                "
            >
                <p className="text-red-500">
                    Failed to load chats
                </p>
            </div>
        );
    }

    // ---------------------------------------------------
    // EMPTY STATE
    // ---------------------------------------------------

    if (
        conversations.length ===
        0
    ) {

        return (
            <div
                className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    px-4
                "
            >
                <div
                    className="
                        mx-auto
                        my-8
                        max-w-sm
                        text-center
                    "
                >
                    <IoMdChatbubbles
                        size={56}
                        className="
                            mx-auto
                            mb-4
                            text-muted
                        "
                    />

                    <p
                        className="
                            mb-2
                            text-2xl
                            font-semibold
                            text-foreground
                        "
                    >
                        No chats yet
                    </p>

                    <p
                        className="
                            mx-auto
                            max-w-xs
                            text-sm
                            text-muted
                        "
                    >
                        Start a conversation by
                        searching for users.
                    </p>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------
    // CHAT LIST
    // ---------------------------------------------------

    return (

        <div
            className="
                flex
                flex-1
                min-h-0
                flex-col

                bg-surface

                transition-colors
                duration-300
            "
        >

            <div
                className="
                    scrollbar-hide
                    flex
                    flex-1
                    min-h-0
                    flex-col

                    gap-1

                    overflow-y-auto

                    px-1
                    pt-2
                    pb-20

                    md:pb-2
                "
            >

                {conversations.map(
                    (chat) => {

                        const otherUser =
                            chat.participants?.find(
                                (
                                    participant
                                ) =>
                                    String(
                                        participant?._id
                                    ) !==
                                    currentUserId
                            );

                        const userId =
                            String(
                                otherUser?._id ||
                                    ""
                            );

                        const isOnline =
                            Boolean(
                                userId &&
                                    presence?.[
                                        userId
                                    ]
                                        ?.online
                            );

                        const isTyping =
                            Boolean(
                                userId &&
                                    typingUsers?.[
                                        chat._id
                                    ]?.has(
                                        userId
                                    )
                            );
console.log(
    "CHAT_RENDER",
    chat._id,
    chat.lastMessage?.text
);
                        return (

                            <NavLink
                                key={
                                    chat._id
                                }
                                to={`/chat/${chat._id}`}
                                className="block cursor-pointer"
                            >

                                {({
                                    isActive,
                                }) => (

                                    <ChatItem
                                        isActive={
                                            isActive
                                        }

                                        name={
                                            chat.name
                                        }

                                        lastMessage={
                                            chat.lastMessage
                                        }

                                        currentUserId={
                                            currentUserId
                                        }

                                        isTyping={
                                            isTyping
                                        }

                                        isOnline={
                                            isOnline
                                        }

                                        time={
                                            chat.updatedAt ||
                                            chat
                                                .lastMessage
                                                ?.createdAt ||
                                            ""
                                        }

                                        avatar={
                                            chat.avatar
                                        }

                                        senderId={
                                            chat
                                                .lastMessage
                                                ?.senderId
                                        }
                                    />

                                )}

                            </NavLink>

                        );

                    }
                )}

            </div>

        </div>

    );
};

export default ChatsPage;