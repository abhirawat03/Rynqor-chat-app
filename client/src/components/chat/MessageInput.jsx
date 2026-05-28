import {
  useRef,
  useState,
} from "react";

import toast
  from "react-hot-toast";

import {
  useParams,
} from "react-router-dom";

import {
  FiPlus,
} from "react-icons/fi";

import { FiX } from "react-icons/fi";

import {
  useSocket,
} from "../../services/socket/useSocket.js";

import {
  useUploadMessageMediaMutation,
} from "../../hooks/messages/useUploadMessageMediaMutation.js";

const MessageInput = ({
  onSend,
}) => {

  const uploadMutation =
    useUploadMessageMediaMutation();

  const {
    conversationId,
  } = useParams();

  const messageInputRef = useRef(null);

  const {
    emitTyping,
    emitStopTyping,
    replaceMessageMedia,
    getSocket,
  } = useSocket();

  const [message, setMessage] =
    useState("");

  const [media, setMedia] =
    useState([]);

  const typingTimeoutRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  // -----------------------------------
  // INPUT CHANGE
  // -----------------------------------

  const handleChange = (
    e
  ) => {

    const value =
      e.target.value;

    setMessage(value);

    emitTyping(
      conversationId
    );

    if (
      typingTimeoutRef.current
    ) {

      clearTimeout(
        typingTimeoutRef.current
      );

    }

    typingTimeoutRef.current =
      setTimeout(() => {

        emitStopTyping(
          conversationId
        );

      }, 1000);

  };

  // -----------------------------------
  // MEDIA CHANGE
  // -----------------------------------

  const handleMediaChange = (
    e
  ) => {

    const files =
      Array.from(
        e.target.files
      );

    const blockedExtensions = [
      "exe",
      "bat",
      "apk",
      "sh",
      "msi",
    ];

    const allowedMimeTypes = [

  // IMAGES
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",

  // VIDEO
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // AUDIO
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",

  // DOCUMENTS
  "application/pdf",
  "text/plain",

];

    const validFiles = [];

    files.forEach((file) => {

      const extension =
        file.name
          ?.split(".")
          ?.pop()
          ?.toLowerCase();

      // BLOCK DANGEROUS FILES
      if (
        blockedExtensions.includes(
          extension
        )
      ) {

        toast.error(
          `${file.name} is not allowed`
        );

        return;

      }

      // MIME VALIDATION
      if (
        !allowedMimeTypes.includes(
          file.type
        )
      ) {

        toast.error(
          `${file.name} is unsupported`
        );

        return;

      }

      validFiles.push({

        file,

        preview:
          URL.createObjectURL(
            file
          ),

      });

    });

    setMedia((prev) => [
      ...prev,
      ...validFiles,
    ]);

    e.target.value = null;

setTimeout(() => {

  messageInputRef.current?.focus();

}, 0);

  };

  // -----------------------------------
  // SEND MESSAGE
  // -----------------------------------

  const handleSend =
    async () => {

      const trimmed =
        message.trim();

      if (
        !trimmed &&
        media.length === 0
      ) {

        return;

      }

      const currentMedia =
        [...media];

      // -----------------------------------
      // LOCAL PREVIEW
      // -----------------------------------

      const localMedia =
        currentMedia.map((item) => ({

          type:
            item.file.type.startsWith(
              "image/"
            )
              ? "image"

              : item.file.type.startsWith(
                  "video/"
                )
                  ? "video"

                  : item.file.type.startsWith(
                      "audio/"
                    )
                      ? "audio"

                      : "file",

          url:
            item.preview,

          name:
            item.file.name,

          uploading: true,

        }));

      // optimistic UI
      const tempMessageId =
        onSend(
          trimmed,
          localMedia
        );

      emitStopTyping(
        conversationId
      );

      if (
        typingTimeoutRef.current
      ) {

        clearTimeout(
          typingTimeoutRef.current
        );

      }

      // clear instantly
      setMessage("");
      setMedia([]);

      try {

        let uploadedMedia =
          [];

        // -----------------------------------
        // UPLOAD MEDIA
        // -----------------------------------

        if (
          currentMedia.length > 0
        ) {

          uploadedMedia =
            await uploadMutation.mutateAsync({

              files:
                currentMedia.map(
                  (item) =>
                    item.file
                ),

            });

          replaceMessageMedia(
            conversationId,
            tempMessageId,
            uploadedMedia
          );

          currentMedia.forEach((item) => {

  URL.revokeObjectURL(
    item.preview
  );

});

        }

        // -----------------------------------
        // SOCKET EMIT
        // -----------------------------------

        const socket =
          getSocket();

        socket.emit(
          "send_message",
          {

            conversationId,

            text:
              trimmed,

            media:
              uploadedMedia,

            clientTempId:
              tempMessageId,

          }
        );

      } catch (err) {

  currentMedia.forEach((item) => {

    URL.revokeObjectURL(
      item.preview
    );

  });

  // log only in non-production for debugging
  if (import.meta.env.MODE !== "production") console.error(err);

  toast.error(
    "Failed to upload media"
  );

}

    };

  // -----------------------------------
  // ENTER SEND
  // -----------------------------------

  const handleKeyDown = (
    e
  ) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (
        message.trim() ||
        media.length > 0
      )
    ) {

      e.preventDefault();

      handleSend();

    }

  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (

    <div
      className="
        shrink-0
        min-w-0

        border-t
        border-border

        bg-surface/90

        backdrop-blur-xl

        transition-colors
        duration-300
      "
    >

      {/* MEDIA PREVIEWS */}
      {media.length > 0 && (

        <div
          className="
            border-b
            border-border

            px-3
            py-3
          "
        >

          <div
            className="
              scrollbar-hide

              mx-auto

              flex
              w-full
              max-w-5xl
              gap-3

              overflow-x-auto
            "
          >

            {media.map(
              (
                item,
                index
              ) => {

                const isImage =
                  item.file.type.startsWith(
                    "image/"
                  );

                const isVideo =
                  item.file.type.startsWith(
                    "video/"
                  );

                return (

                  <div
                    key={index}
                    className="
                      group

                      relative

                      h-24
                      w-24

                      shrink-0

                      overflow-hidden
                      rounded-2xl

                      border
                      border-border

                      bg-surface-secondary

                      shadow-sm
                    "
                  >

                    {/* IMAGE */}
                    {isImage && (

                      <img
                        src={
                          item.preview
                        }

                        alt="preview"

                        className="
                          h-full
                          w-full

                          object-cover
                        "
                      />

                    )}

                    {/* VIDEO */}
                    {isVideo && (

                      <video
                        src={
                          item.preview
                        }

                        className="
                          h-full
                          w-full

                          object-cover
                        "
                      />

                    )}

                    {/* FILE */}
                    {!isImage &&
                      !isVideo && (

                        <div
                          className="
                            flex
                            h-full
                            w-full
                            flex-col
                            items-center
                            justify-center
                            gap-2

                            p-2

                            text-center
                          "
                        >

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center

                              rounded-xl

                              bg-accent

                              text-xs
                              font-semibold

                              text-white
                            "
                          >

                            {
                              item.file.name
                                ?.split(".")
                                ?.pop()
                                ?.toUpperCase()
                              || "FILE"
                            }

                          </div>

                          <p
                            className="
                              line-clamp-2
                              break-all

                              text-[10px]

                              text-muted
                            "
                          >
                            {
                              item.file.name
                            }
                          </p>

                        </div>

                      )}

                    {/* REMOVE */}
                    <button
                      type="button"

                      onClick={() => {

  setMedia((prev) => {

    URL.revokeObjectURL(
      prev[index].preview
    );

    return prev.filter(
      (
        _,
        i
      ) =>
        i !== index
    );

  });

}}

                      className="
                        absolute
                        cursor-pointer
                        right-1
                        top-1

                        flex
                        h-6
                        w-6
                        items-center
                        justify-center

                        rounded-full

                        bg-black/70
                        text-sm
                        text-white

                        transition-opacity
                        duration-200

                        opacity-100
                        md:opacity-0
                        md:group-hover:opacity-100
                      "
                    >
                      <FiX size={14} />
                    </button>

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}

      {/* INPUT BAR */}
      <div
        className="
          px-3
          py-3

          pb-[calc(12px+env(safe-area-inset-bottom))]
        "
      >

        <div
          className="
            mx-auto

            flex
            w-full
            max-w-5xl
            items-end
            gap-2
          "
        >

          {/* INPUT WRAPPER */}
          <div
            className="
              flex
              flex-1
              items-end

              overflow-hidden
              rounded-2xl

              border
              border-border

              bg-surface

              shadow-sm

              transition-all
              duration-200

              focus-within:border-accent
              focus-within:ring-4
              focus-within:ring-accent/10
            "
          >

            {/* FILE INPUT */}
            <input
              id="media"
              name="media"
              type="file"
              multiple

              ref={fileInputRef}

              onChange={
                handleMediaChange
              }

              className="hidden"
            />

            {/* MEDIA BUTTON */}
            <button
              type="button"
              tabIndex={-1}

              onClick={() =>
                fileInputRef.current?.click()
              }

              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                cursor-pointer
                justify-center

                text-muted

                transition-all
                duration-200

                hover:text-accent
              "
            >

              <FiPlus
                size={22}
              />

            </button>

            {/* TEXT INPUT */}
            <input
              ref={messageInputRef}
              id="message"
              name="message"

              value={message}

              onChange={
                handleChange
              }

              onKeyDown={
                handleKeyDown
              }

              placeholder="Type a message..."

              className="
                flex-1

                bg-transparent

                py-3
                pr-4

                text-sm

                text-foreground

                placeholder:text-muted

                outline-none
              "
            />

          </div>

          {/* SEND BUTTON */}
          <button
            type="button"

            onClick={
              handleSend
            }

            disabled={
              !message.trim()
              &&
              media.length === 0
            }

            className="
              h-12
              shrink-0

              rounded-2xl
              cursor-pointer

              bg-accent

              px-5

              text-sm
              font-medium
              text-white

              shadow-sm

              transition-all
              duration-200

              hover:brightness-110

              active:scale-[0.98]

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            Send

          </button>

        </div>

      </div>

    </div>

  );

};

export default MessageInput;