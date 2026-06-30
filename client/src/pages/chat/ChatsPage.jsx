import { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { IoMdChatbubbles } from "react-icons/io";
import { FiUsers, FiSearch, FiX } from "react-icons/fi";

import ChatItem from "../../components/chat/ChatItem.jsx";
import { ChatListSkeleton } from "../../components/common/Skeleton.jsx";
import CreateGroupModal from "../../components/chat/CreateGroupModal.jsx";

import { useConversationsQuery } from "../../hooks/conversations/useConversationsQuery.js";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useSocket } from "../../services/socket/useSocket.js";

const ChatsPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { presence, typingUsers } = useSocket();

  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useConversationsQuery();



  // ---------------------------------------------------
  // CURRENT USER
  // ---------------------------------------------------

  const { data: user, isLoading: userLoading } = useCurrentUserQuery();

  const currentUserId = String(user?._id || "");

  const filteredConversations = conversations.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    if (chat.type === "group") {
      return chat.name?.toLowerCase().includes(query);
    } else {
      const targetUser =
        chat.type === "self"
          ? chat.participants?.[0]
          : chat.participants?.find((p) => String(p._id) !== currentUserId);

      return (
        targetUser?.fullName?.toLowerCase().includes(query) ||
        targetUser?.username?.toLowerCase().includes(query)
      );
    }
  });


  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  if (isLoading || userLoading) {
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
      <div className="flex items-center justify-center w-full h-full ">
        <p className="text-red-500">Failed to load chats</p>
      </div>
    );
  }

  // ---------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------

  if (conversations.length === 0) {
    return (
      <div className="relative flex flex-col flex-1 min-h-0 bg-surface">
        <div className="flex items-center justify-center flex-1 px-4 ">
          <div className="max-w-sm mx-auto my-8 text-center ">
            <IoMdChatbubbles size={56} className="mx-auto mb-4 text-muted" />

            <p className="mb-2 text-2xl font-semibold text-foreground">
              No chats yet
            </p>

            <p className="max-w-xs mx-auto text-sm text-muted">
              Start a conversation by searching for users.
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
    <div className="relative flex flex-col flex-1 min-h-0 transition-colors duration-300 bg-surface">
      {/* LOCAL FIND/FILTER CHAT SEARCH BAR */}
      <div className="px-3 py-2 border-b border-border/40">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Find chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-foreground border border-transparent focus:border-accent focus:bg-background focus:outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-1 px-1 pt-2 pb-20 overflow-y-auto scrollbar-hide md:pb-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-muted">
            <FiSearch size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs max-w-xs mt-1">
              No active conversations match "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isGroup = chat.type === "group";

            const otherUser = isGroup
              ? null
              : chat.participants?.find(
                  (participant) => String(participant?._id) !== currentUserId,
                );

            const userId = isGroup ? "" : String(otherUser?._id || "");

            const isOnline =
              !isGroup && Boolean(userId && presence?.[userId]?.online);

            const isTyping = isGroup
              ? Boolean(
                  typingUsers?.[chat._id] &&
                  Array.from(typingUsers[chat._id]).some(
                    (id) => id !== currentUserId,
                  ),
                )
              : Boolean(userId && typingUsers?.[chat._id]?.has(userId));

            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="block cursor-pointer"
              >
                <ChatItem
                  isActive={chat._id === conversationId}
                  name={chat.name}
                  lastMessage={chat.lastMessage}
                  currentUserId={currentUserId}
                  isTyping={isTyping}
                  isOnline={isOnline}
                  time={chat.updatedAt || chat.lastMessage?.createdAt || ""}
                  avatar={chat.avatar}
                  senderId={chat.lastMessage?.senderId}
                />
              </div>
            );
          })
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
