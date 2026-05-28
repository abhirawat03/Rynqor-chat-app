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

  const initializedRef =
    useRef(false);

  useEffect(() => {

    if (
      data &&
      !initializedRef.current
    ) {

      setInitialConversations(
        data
      );

      initializedRef.current = true;

    }

  }, [data]);

  const {
    data:user,
    isLoading:loading,
  } = useCurrentUserQuery();

  const currentUserId = String(
    user?._id || ""
  );

  // LOADING

  if (isLoading || loading) {

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

  // ERROR

  if (isError) {

    return (
      <div
  className="
    flex
    min-h-screen
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

      {/* EMPTY */}
      {conversations.length === 0 ? (

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
              Start a conversation by searching for users.
            </p>

          </div>

        </div>

      ) : (

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
                  (p) =>
                    String(p._id) !==
                    currentUserId
                );

              const userId =
                otherUser?._id?.toString();

              const isOnline =
                presence?.[userId]
                  ?.online || false;

              const isTyping =
                typingUsers?.[
                  chat._id
                ]?.has(userId);

              return (
                <NavLink
                  key={chat._id}
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

                      name={chat.name}

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
                        chat.lastMessage
                          ?.createdAt ||
                        ""
                      }

                      avatar={
                        chat.avatar
                      }

                      senderId={
                        chat.lastMessage
                          ?.senderId
                      }
                    />

                  )}

                </NavLink>
              );

            }
          )}

        </div>

      )}

    </div>
  );
};

export default ChatsPage;