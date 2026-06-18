import { useEffect} from "react";

import { NavLink } from "react-router-dom";
import { IoMdChatbubbles } from "react-icons/io";

import ChatItem from "../../components/chat/ChatItem.jsx";

import { useConversationsQuery } from "../../hooks/conversations/useConversationsQuery.js";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useSocket } from "../../services/socket/useSocket.js";

const ChatsPage = () => {

    const {
        presence,
        typingUsers,
    } = useSocket();

    const {
        data:conversations = [],
        isLoading,
        isError,
    } = useConversationsQuery();

    useEffect(() => {
    console.log("CHATS PAGE MOUNTED");
}, []);

console.log(
    "QUERY",
    isLoading,
    conversations?.length
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
        "CONVERSATIONS CACHE",
        conversations.map(c => ({
            id: c._id,
            updatedAt: c.updatedAt,
            lastMessage: c.lastMessage?._id,
        }))
    );
}, [conversations]);
useEffect(() => {
    console.log(
        "CONVERSATIONS",
        conversations.map(c => ({
            id: c._id,
            text: c.lastMessage?.text,
        }))
    );
}, [conversations]);
    // ---------------------------------------------------
    // LOADING
    // ---------------------------------------------------

    if (
        isLoading ||
        userLoading
    ) {

        return (
            <div
                className="flex items-center justify-center w-full h-full "
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
                className="flex items-center justify-center w-full h-full "
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
                className="flex items-center justify-center flex-1 px-4 "
            >
                <div
                    className="max-w-sm mx-auto my-8 text-center "
                >
                    <IoMdChatbubbles
                        size={56}
                        className="mx-auto mb-4 text-muted"
                    />

                    <p
                        className="mb-2 text-2xl font-semibold text-foreground"
                    >
                        No chats yet
                    </p>

                    <p
                        className="max-w-xs mx-auto text-sm text-muted"
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
            className="flex flex-col flex-1 min-h-0 transition-colors duration-300 bg-surface"
        >

            <div
                className="flex flex-col flex-1 min-h-0 gap-1 px-1 pt-2 pb-20 overflow-y-auto scrollbar-hide md:pb-2"
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