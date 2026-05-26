import {
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useRef, useEffect } from "react";

import ChatHeader from "../../components/chat/ChatHeader.jsx";
import MessageInput from "../../components/chat/MessageInput.jsx";
import MessageList from "../../components/chat/MessageList.jsx";

import { useSocket } from "../../services/socket/useSocket.js";

import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import { useConversationByIdQuery } from "../../hooks/conversations/useConversationByIdQuery.js";

import { useChatScroll } from "../../hooks/chat/useChatScroll.js";
import { useReadReceipts } from "../../hooks/chat/useReadReceipts.js";
import { useChatMessages } from "../../hooks/chat/useChatMessages.js";
import { useState } from "react";
import UserProfilePage from "../profile/UserProfilePage.jsx";

const ConversationPage = () => {
  const navigate = useNavigate();
  const { conversationId } =
    useParams();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setShowProfile(false);
  }, [conversationId]);
  
  const {
    getSocket,
    presence,
    typingUsers,
  } = useSocket();

  const {
    data:user,
    isLoading:loading,
  } = useCurrentUserQuery();

  const {
    data: conversation,
    isLoading: convLoading,
    isError,
  } =
    useConversationByIdQuery(
      conversationId
    );

  const currentUserId =
    user?._id;

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

  const containerRef =
    useRef(null);

  // OTHER USER

  const otherUser =
    conversation?.participants?.find(
      (u) =>
        u._id !== currentUserId
    );

  const userId =
    otherUser?._id?.toString();

  const isOnline =
    presence?.[userId]
      ?.online || false;

  const isTyping =
    otherUser?._id &&
    typingUsers[
      conversationId
    ]?.has(otherUser._id);

  const readReceipts =
    useReadReceipts({

      conversationId,

      chatMessages,

      currentUserId,

      containerRef,

      getSocket,
    });

  useChatScroll({

    containerRef,

    fetchNextPage,

    hasNextPage,

    isFetchingNextPage,

    chatMessagesLength:
      chatMessages.length,

    isTyping,

    emitReadReceipt:
      readReceipts.emitReadReceipt,
  });

  // AUTH LOADING
  useEffect(() => {

  const handleEsc = (e) => {

    if (e.key === "Escape") {
      document.activeElement?.blur();
      navigate("/");

      // OR:
      // navigate("/");

    }

  };

  window.addEventListener(
    "keydown",
    handleEsc
  );

  return () => {

    window.removeEventListener(
      "keydown",
      handleEsc
    );

  };

}, [navigate]);

  if (loading) {

    return (
      <div
        className="
          flex
          flex-1
          items-center
          justify-center

          duration-300
        "
      >
        Loading...
      </div>
    );

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

    return (
      <div
        className="
          flex
          flex-1
          items-center
          justify-center


          transition-colors
          duration-300
        "
      >
        Loading chat...
      </div>
    );

  }

  // ERROR

  if (isError) {

    return (
      <div
        className="
          flex
          flex-1
          items-center
          justify-center

          bg-background

          text-red-500

          transition-colors
          duration-300
        "
      >
        Failed to load chat
      </div>
    );

  }

  // UI

  return (
    <div
  className="
    relative

    flex
    flex-1

    overflow-hidden
  "
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

    ${
  showProfile
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

        containerRef={
          containerRef
        }

        chatMessages={
          chatMessages
        }

        currentUserId={
          currentUserId
        }

        isTyping={
          isTyping
        }
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
    className="
      absolute
      inset-0
      z-50

      flex

      bg-background

      xl:static
xl:z-auto
xl:bg-transparent
    "
  >

    {/* OVERLAY */}
    <div
      onClick={() =>
        setShowProfile(false)
      }

      className="
        hidden

        bg-black/30

        backdrop-blur-sm

        xl:block
xl:flex-1
      "
    />

    {/* PANEL */}
    <UserProfilePage
      userId={conversation?.type ===
    "self"
      ? currentUserId
      : userId}
      isOnline={
          isOnline
        }
      conversationId={
          conversationId
        }
      onClose={() =>
        setShowProfile(false)
      }
    />

  </div>

)}
    </div>
  );
};

export default ConversationPage;