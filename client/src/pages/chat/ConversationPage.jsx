import {
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useRef,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";

import ChatHeader from "../../components/chat/ChatHeader.jsx";
import MessageInput from "../../components/chat/MessageInput.jsx";
import MessageList from "../../components/chat/MessageList.jsx";

import { useSocket } from "../../services/socket/useSocket.js";

import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useConversationByIdQuery } from "../../hooks/conversations/useConversationByIdQuery.js";

import { useReadReceipts } from "../../hooks/chat/useReadReceipts.js";
import { useChatMessages } from "../../hooks/chat/useChatMessages.js";
import ScrollToBottomButton from "../../components/chat/ScrollToBottomButton.jsx";
import { useChatScroll } from "../../hooks/chat/useChatScroll.js";
import { Skeleton, MessageListSkeleton, ConversationSkeleton } from "../../components/common/Skeleton.jsx";

const UserProfilePage = lazy(
  () =>
    import(
      "../profile/UserProfilePage.jsx"
    )
);

const ConversationPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const [showProfile, setShowProfile] = useState(false);
  const loadingMoreRef = useRef(false);

  const {
    getSocket,
    presence,
    typingUsers,
  } = useSocket();

  const {
    data: user,
    isLoading: loading,
  } = useCurrentUserQuery();

  const {
    data: conversation,
    isLoading: convLoading,
    isError,
  } =
    useConversationByIdQuery(
      conversationId
    );

  const currentUserId = user?._id;

  const {
    chatMessages,
    sendMessage,
    messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages({
    conversationId,
    currentUserId,
  });

  const {
  virtuosoRef,
  isAtBottom,
  setIsAtBottom,
  unreadCount,
  setUnreadCount,
} = useChatScroll({
  chatMessages,
  currentUserId,
  conversationId,
  messagesLoading,
});

const handleBottomChange = (
  bottom
) => {
  console.log(
    "BOTTOM:",
    bottom
  );

  setIsAtBottom(bottom);
};

const otherUser =
  conversation?.participants?.find(
    (u) =>
      u._id !== currentUserId
  );

const userId = otherUser?._id?.toString();

const isOnline = presence?.[userId]?.online || false;

const isTyping = Boolean(
  otherUser?._id &&
  typingUsers[
    conversationId
  ]?.has(otherUser._id)
);

useReadReceipts({
  conversationId,
  chatMessages,
  currentUserId,
  getSocket,
  isAtBottom,
});

useEffect(() => {
  setShowProfile(false);
  setUnreadCount(0);
}, [conversationId, setUnreadCount]);

  // KEYBOARD SHORTCUTS (Escape to close, End to scroll to bottom)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        document.activeElement?.blur();
        navigate("/");
      }

      if (e.key === "End") {
        e.preventDefault();
        setUnreadCount(0);
        const firstItemIndex = Math.max(0, 10000 - chatMessages.length);
        const lastIndex = chatMessages.length > 0 ? (firstItemIndex + chatMessages.length - 1) : 0;
        virtuosoRef.current?.scrollToIndex({
          index: lastIndex,
          align: "end",
          behavior: "smooth",
        });
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [navigate, chatMessages.length, setUnreadCount, virtuosoRef]);

const handleTopReached =
  async () => {

    if (
      loadingMoreRef.current ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }

    loadingMoreRef.current = true;

    try {
      await fetchNextPage();
    } finally {
      loadingMoreRef.current = false;
    }
  };

  if (loading) {
    return <ConversationSkeleton />;
  }

  // NO USER

  if (!user) {

    return (
      <Navigate
        to="/auth"
        replace
      />
    );

  }

  // CHAT LOADING

  if (
    convLoading ||
    messagesLoading
  ) {
    return <ConversationSkeleton />;
  }

  // ERROR

  if (isError) {

    return (
      <div
        className="flex items-center justify-center flex-1 text-red-500 transition-colors duration-300 bg-background"
      >
        Failed to load chat
      </div>
    );

  }

  return (
    <div
      className="relative flex flex-1 overflow-hidden "
    >
      <div
        className={`
    flex
    flex-1
    min-h-0
    flex-col

    overflow-hidden

    bg-background

    transition-[max-width]
duration-300

    ${showProfile
            ? "xl:max-w-[calc(100%-420px)]"
            : ""
          }
  `}
      >

        {/* HEADER */}
        <ChatHeader
          name={
            conversation?.name
          }
          avatar={
            conversation?.avatar
          }
          isOnline={
            isOnline
          }
          isSelf={
            conversation?.type ===
            "self"
          }
          profileId={
            conversation?.type === "self"
              ? currentUserId
              : userId
          }
          onOpenProfile={() =>
            setShowProfile(true)
          }
        />

        {/* MESSAGES */}
        <MessageList
          conversationId={conversationId}
          virtuosoRef={virtuosoRef}
          chatMessages={chatMessages}
          currentUserId={currentUserId}
          isTyping={isTyping}
          onTopReached={handleTopReached}
          onBottomStateChange={handleBottomChange}
          isFetchingNextPage={isFetchingNextPage}
        />

        <ScrollToBottomButton
          isAtBottom={isAtBottom}
          unreadCount={unreadCount}
          onClick={() => {
            setUnreadCount(0);
            const firstItemIndex = Math.max(0, 10000 - chatMessages.length);
            const lastIndex = chatMessages.length > 0 ? (firstItemIndex + chatMessages.length - 1) : 0;
            virtuosoRef.current?.scrollToIndex({
              index: lastIndex,
              align: "end",
              behavior: "smooth",
            });
          }}
        />

        {/* INPUT */}
        <MessageInput
          onSend={
            sendMessage
          }
        />

      </div>
      {showProfile && (

        <div
          className="absolute inset-0 z-50 flex bg-background xl:static xl:z-auto xl:bg-transparent"
        >

          {/* OVERLAY */}
          <div
            onClick={() =>
              setShowProfile(false)
            }

            className="hidden bg-black/30 backdrop-blur-sm xl:block xl:flex-1"
          />

          {/* PANEL */}
          <Suspense
            fallback={
              <div
                className="
        flex
        h-full
        w-full
        items-center
        justify-center

        bg-surface

        xl:w-105
      "
              >
                Loading profile...
              </div>
            }
          >
            <UserProfilePage
              userId={
                conversation?.type ===
                  "self"
                  ? currentUserId
                  : userId
              }
              isOnline={isOnline}
              conversationId={
                conversationId
              }
              onClose={() =>
                setShowProfile(false)
              }
            />
          </Suspense>

        </div>

      )}
    </div>
  );
};

export default ConversationPage;