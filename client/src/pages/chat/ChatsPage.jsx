import { useEffect, useState } from "react";

import { NavLink } from "react-router-dom";
import { IoMdChatbubbles } from "react-icons/io";
import { FiUsers } from "react-icons/fi";

import ChatItem from "../../components/chat/ChatItem.jsx";
import { ChatListSkeleton } from "../../components/common/Skeleton.jsx";
import CreateGroupModal from "../../components/chat/CreateGroupModal.jsx";

import { useConversationsQuery } from "../../hooks/conversations/useConversationsQuery.js";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useSocket } from "../../services/socket/useSocket.js";

const ChatsPage = () => {
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

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
            <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto">
                {/* Header title skeleton simulation */}
                <div className="p-4 border-b border-border">
                    <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-800/35 rounded-md animate-pulse" />
                </div>
                <ChatListSkeleton count={6} />
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
            <div className="relative flex flex-col flex-1 min-h-0 bg-surface">
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

                {/* FLOATING ACTION BUTTON */}
                <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="absolute bottom-20 md:bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                    title="Create Group Chat"
                >
                    <FiUsers size={20} />
                </button>

                <CreateGroupModal 
                    isOpen={isGroupModalOpen} 
                    onClose={() => setIsGroupModalOpen(false)} 
                />
            </div>
        );
    }

    // ---------------------------------------------------
    // CHAT LIST
    // ---------------------------------------------------

    return (

        <div
            className="relative flex flex-col flex-1 min-h-0 transition-colors duration-300 bg-surface"
        >

            <div
                className="flex flex-col flex-1 min-h-0 gap-1 px-1 pt-2 pb-20 overflow-y-auto scrollbar-hide md:pb-2"
            >

                {conversations.map(
                    (chat) => {

                        const isGroup = chat.type === "group";

                        const otherUser = isGroup
                            ? null
                            : chat.participants?.find(
                                (
                                    participant
                                ) =>
                                    String(
                                        participant?._id
                                    ) !==
                                    currentUserId
                            );

                        const userId = isGroup
                            ? ""
                            : String(
                                otherUser?._id ||
                                    ""
                            );

                        const isOnline =
                            !isGroup &&
                            Boolean(
                                userId &&
                                    presence?.[
                                        userId
                                    ]
                                        ?.online
                            );

                        const isTyping = isGroup
                            ? Boolean(
                                typingUsers?.[chat._id] &&
                                Array.from(typingUsers[chat._id]).some(id => id !== currentUserId)
                            )
                            : Boolean(
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

            {/* FLOATING ACTION BUTTON */}
            <button
                onClick={() => setIsGroupModalOpen(true)}
                className="absolute bottom-20 md:bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Create Group Chat"
            >
                <FiUsers size={20} />
            </button>

            <CreateGroupModal 
                isOpen={isGroupModalOpen} 
                onClose={() => setIsGroupModalOpen(false)} 
            />
        </div>

    );
};

export default ChatsPage;