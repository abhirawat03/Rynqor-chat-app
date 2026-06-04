import { memo, useState } from "react";

import MessageMedia from "./MessageMedia";

const Message = memo(({
  message,
  isOwn,
  syncState,
}) => {

  const {
    text,
    media = [],
    createdAt,
    status,
    messageType,
  } = message;

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
          mb-2

          flex

          ${
            isOwn
              ? "justify-end"
              : "justify-start"
          }
        `}
      >

        <div
          className={`
            relative

            max-w-xs

            break-words

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
                break-words

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