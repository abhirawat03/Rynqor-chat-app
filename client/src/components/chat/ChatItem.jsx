import { memo } from "react";
import { getRelativeTimeShort } from "../../utils/date.js";

const ChatItem = memo(({
    name,
    lastMessage,
    time,
    senderId,
    currentUserId,
    avatar,
    isActive,
    isTyping,
    isOnline,
}) => {

    // TIME
    const formattedTime = getRelativeTimeShort(time);

    // USER
    const isMe =
  String(senderId?._id || senderId) ===
  String(currentUserId);

    // MEDIA LABELS
    const mediaLabels = {
        image: "🖼 Photo",
        video: "🎥 Video",
        audio: "🎵 Audio",
        file: "📄 Document",
    };

    // PREVIEW TEXT
    const getPreviewText = () => {

        if (isTyping) {
            return "Typing...";
        }

        if (!lastMessage) {
            return "No messages yet";
        }

        const prefix =
            isMe ? "You: " : "";

        const mediaType =
            lastMessage?.media?.[0]?.type;

        const mediaLabel =
            mediaLabels[mediaType] ||
            "Attachment";

        // MEDIA
        if (
            lastMessage.messageType ===
            "media"
        ) {

            return (
                prefix + mediaLabel
            );

        }

        // MIXED
        if (
            lastMessage.messageType ===
            "mixed"
        ) {

            const trimmedText =
                lastMessage.text
                    ?.trim()
                    ?.slice(0, 26);

            const hasLongText =
                lastMessage.text?.length >
                26;

            return (
                prefix +
                mediaLabel +
                " • " +
                trimmedText +
                (
                    hasLongText
                        ? "..."
                        : ""
                )
            );

        }

        // TEXT
        return (
            prefix +
            (
                lastMessage.text ||
                "Message"
            )
        );

    };

    return (
        <div
            className={`
        group
        
        flex
        cursor-pointer
        items-center
        gap-3

        rounded-2xl

        border

        px-3
        py-2.5

        transition-all
        duration-200
        active:scale-[0.98]

        ${isActive
                    ? `
              border-border
              bg-hover
            `
                    : `
              border-transparent

              bg-surface

              hover:bg-hover
            `
                }
      `}
        >

            {/* AVATAR */}
            <div
                className="
          relative
          shrink-0
        "
            >

                <div
                    className="
            flex
            h-14
            w-14
            items-center
            justify-center

            overflow-hidden
            rounded-full

            bg-surface-secondary

            text-sm
            font-semibold

            text-foreground
          "
                >

                    {avatar ? (

                        <img
                            src={avatar?.url}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            className="
                h-full
                w-full
                border-2
                border-border
                rounded-full
                object-cover
              "
                        />

                    ) : (

                        <span>
                            {name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                        </span>

                    )}

                </div>

                {/* ONLINE */}
                {isOnline && (

                    <div
                        className="
              absolute
              bottom-0
              right-0

              h-4
              w-4

              rounded-full

              border-2
              border-surface

              bg-green-500
            "
                    />

                )}

            </div>

            {/* CONTENT */}
            <div
                className="
          min-w-0
          flex-1
        "
            >

                <div
                    className="
            flex
            items-center
            justify-between
            gap-2
          "
                >

                    {/* NAME */}
                    <p
                        className="
              truncate
              text-sm
              font-medium

              text-foreground
            "
                    >
                        {name}
                    </p>

                </div>

                {/* PREVIEW */}
                <p
                    className={`
            mt-0.5

            truncate

            text-xs

            ${isTyping
                            ? "text-emerald-500"
                            : "text-muted"
                        }
          `}
                >
                    {getPreviewText()}
                    {time && ` • ${formattedTime}`}
                </p>

            </div>

        </div>
    );
});

export default ChatItem;