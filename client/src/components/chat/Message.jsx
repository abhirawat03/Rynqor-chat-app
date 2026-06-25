import { memo, useState } from "react";

import MessageMedia from "./MessageMedia";

const Message = memo(({
  message,
  isOwn,
  syncState,
  isGroup = false,
  hideAvatar = false,
  hideName = false,
}) => {

  const senderName = message.senderId?.fullName || message.senderId?.username || "Someone";

  const {
    text,
    media = [],
    createdAt,
    status,
    messageType,
  } = message;

  if (messageType === "system") {
    return (
      <div className="flex justify-center w-full my-3 px-4">
        <div className="bg-zinc-150 dark:bg-zinc-800/40 border border-border/30 rounded-full px-4 py-1.5 text-center text-[11px] text-muted-foreground/80 max-w-[85%] select-none leading-relaxed shadow-xs">
          📢 {text}
        </div>
      </div>
    );
  }

  const [preview, setPreview] =
    useState(null);

  const formattedTime =
    createdAt
      ? new Date(
          createdAt
        ).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "";

  const isMediaOnly =
    messageType === "media";

  const isMixed =
    messageType === "mixed";

  const mediaWidth =
    isMixed
      ? "w-[220px]"
      : "w-[260px]";

  const getStatusIcon = () => {

    if (
      syncState === "sending"
    ) {

      return "⏳";

    }

    if (
      syncState === "failed"
    ) {

      return "❌";

    }

    if (status === "sent") {

      return "✓";

    }

    return "✓✓";

  };

  return (
    <>

      {/* MESSAGE */}
      <div
        className={`
          flex
          gap-2.5
          items-end
          ${
            isOwn
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        {!isOwn && (
          <div className="w-8 shrink-0 flex justify-center mb-1">
            {!hideAvatar ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold overflow-hidden select-none border border-border/50"
                title={senderName}
              >
                {message.senderId?.avatar?.url ? (
                  <img
                    src={message.senderId.avatar.url}
                    alt={senderName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-muted-foreground">
                    {senderName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-col max-w-[70%]">
          {isGroup && !isOwn && !hideName && (
            <span className="text-[10px] font-bold text-muted/70 ml-2 mb-0.5 select-none uppercase tracking-wider">
              {senderName}
            </span>
          )}

          <div
            className={`
              relative

            max-w-xs

            wrap-break-word

            rounded-2xl

            shadow-sm

            backdrop-blur-sm

            transition-all
            duration-200

            ${
              isMediaOnly
                ? "p-1.5 pb-6"
                : "px-3 py-2.5"
            }

            ${
              isOwn
                ? `
                  bg-accent
                  text-white
                `
                : `
                  border
                  border-border

                  bg-surface

                  text-foreground
                `
            }
          `}
        >

          {/* MEDIA */}
          {media.length > 0 && (

            <div
              className="
                grid
                gap-1.5
              "
            >

              {media.map(
                (
                  item
                ) => (

                  <MessageMedia
                    key={item._id}
                    item={item}
                    mediaWidth={
                      mediaWidth
                    }
                    setPreview={
                      setPreview
                    }
                  />

                )
              )}

            </div>

          )}

          {/* TEXT */}
          {text && (

            <p
              className={`
                mt-1

                whitespace-pre-wrap
                wrap-break-word

                px-1

                text-sm
                leading-relaxed

                ${
                  isOwn
                    ? "text-white/95"
                    : "text-foreground"
                }
              `}
            >
              {text}
            </p>

          )}

          {/* FOOTER */}
          <div
            className={`
              mt-1

              flex
              items-center
              justify-end
              gap-1

              text-[10px]

              ${
                isMediaOnly
                  ? `
                    absolute
                    bottom-2
                    right-2

                    rounded-full

                    bg-black/45

                    px-2
                    py-1

                    text-white

                    backdrop-blur-md
                  `
                  : isOwn
                    ? "text-white/70"
                    : "text-muted"
              }
            `}
          >

            {/* TIME */}
            <span
              className={`
                ${
                  isMediaOnly
                    ? ""
                    : `
                      rounded-full

                      px-1
                    `
                }
              `}
            >
              {formattedTime}
            </span>

            {/* STATUS */}
            {isOwn && (

              <span
                className={`
                  font-bold
                  ${
                    status ===
                    "read"

                      ? "text-sky-300"

                      : "text-white/90"
                  }
                `}
              >
                {getStatusIcon()}
              </span>

            )}

          </div>

          </div>

        </div>

      </div>

      {/* PREVIEW MODAL */}
      {preview && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() =>
            setPreview(null)
          }
        >

          <div
            className="max-w-4xl max-h-full "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* IMAGE */}
            {preview.type ===
              "image" && (

                <img
                  src={preview.url}
                  alt={preview.name}
                  className="
                    max-h-[90vh]

                    rounded-2xl
                  "
                />

              )}

            {/* VIDEO */}
            {preview.type ===
              "video" && (

                <video
                  muted
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="
                    max-h-[90vh]

                    rounded-2xl
                  "
                >
                  <source
                    src={
                      preview.url
                    }
                  />
                </video>

              )}

            {/* AUDIO */}
            {preview.type ===
              "audio" && (

                <div
                  className="p-6 rounded-2xl bg-surface"
                >

                  <audio
                    controls
                    autoPlay
                    src={
                      preview.url
                    }
                    className="w-full "
                  />

                </div>

              )}

          </div>

        </div>

      )}

    </>
  );
});

export default Message;