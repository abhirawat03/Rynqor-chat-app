// Renders the rich message input bar supporting attachments, throttled typing heartbeats, and optimistic media uploads.
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "../../services/socket/useSocket.js";
import { useUploadMessageMediaMutation } from "../../hooks/messages/useUploadMessageMediaMutation.js";
import { updateMessagesCache } from "../../services/socket/helpers/updateMessagesCache.js";
import { BLOCKED_EXTENSIONS, ALLOWED_MIME_TYPES } from "../../constants/upload.js";

const MessageInput = ({ onSend }) => {
  const uploadMutation = useUploadMessageMediaMutation();
  const queryClient = useQueryClient();

  const { conversationId } = useParams();

  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastEmitTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [media, setMedia] = useState([]);

  const { emitTyping, emitStopTyping, getSocket } = useSocket();

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    const now = Date.now();
    // Throttle outgoing typing events to once every 2 seconds
    if (now - lastEmitTimeRef.current > 2000) {
      emitTyping(conversationId);
      lastEmitTimeRef.current = now;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing heartbeat after 1.5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversationId);
      lastEmitTimeRef.current = 0;
    }, 1500);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach((file) => {
      const extension = file.name?.split(".")?.pop()?.toLowerCase();

      // Enforce file extension and MIME type security policies
      if (BLOCKED_EXTENSIONS.includes(extension)) {
        toast.error(`${file.name} is not allowed`);
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`${file.name} is unsupported`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setMedia((prev) => [...prev, ...validFiles]);
    e.target.value = null; // Clear file input so the same file can be reselected if removed

    // Refocus input bar
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  // -----------------------------------
  // SEND MESSAGE HANDLER
  // -----------------------------------
  // Orchestrates optimistic rendering, file uploading, cache progress tracking, and socket transmissions.
  const handleSend = async () => {
    const trimmed = message.trim();

    // Prevent submitting empty text with no attachments
    if (!trimmed && media.length === 0) {
      return;
    }

    const currentMedia = [...media];

    // Build optimistic media indicators
    const localMedia = currentMedia.map((item) => ({
      type: item.file.type.startsWith("image/")
        ? "image"
        : item.file.type.startsWith("video/")
          ? "video"
          : item.file.type.startsWith("audio/")
            ? "audio"
            : "file",
      url: item.preview,
      name: item.file.name,
      uploading: true, // Flags component to show local loading spinners over previews
    }));

    // Trigger parent callback to create the optimistic message record in state
    const tempMessageId = onSend(trimmed, localMedia);

    // Stop active typing animations instantly
    emitStopTyping(conversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset input states instantly
    setMessage("");
    setMedia([]);

    try {
      let uploadedMedia = [];

      // If media attachments exist, upload them first
      if (currentMedia.length > 0) {
        uploadedMedia = await uploadMutation.mutateAsync({
          files: currentMedia.map((item) => item.file),
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            // Update the optimistic message's upload progress in the local React Query cache
            updateMessagesCache({
              queryClient,
              conversationId,
              updater: (messages) =>
                messages.map((msg) =>
                  msg.clientTempId === tempMessageId
                    ? {
                        ...msg,
                        media: msg.media?.map((m) => ({
                          ...m,
                          uploadProgress: progress,
                        })),
                      }
                    : msg,
                ),
            });
          },
        });

        // Swap the optimistic local blob URLs with the returned remote server storage URLs
        updateMessagesCache({
          queryClient,
          conversationId,
          updater: (messages) =>
            messages.map((msg) =>
              msg.clientTempId === tempMessageId
                ? {
                    ...msg,
                    media: uploadedMedia,
                  }
                : msg,
            ),
        });

        // Delay revoking the local blob URLs for 5 seconds to prevent visual layout flashing
        // while the browser loads the remote image URLs in the background.
        setTimeout(() => {
          currentMedia.forEach((item) => {
            URL.revokeObjectURL(item.preview);
          });
        }, 5000);
      }

      // Transmit message payload over Socket connection to distribute to other room participants
      const socket = getSocket();
      socket.emit("send_message", {
        conversationId,
        text: trimmed,
        media: uploadedMedia,
        clientTempId: tempMessageId,
      });
    } catch (err) {
      // Clean up local blob urls on upload failure
      currentMedia.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      if (import.meta.env.MODE !== "production") console.error(err);
      toast.error("Failed to upload media");
    }
  };

  // Submit message when Enter key is pressed without Shift modifier
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (message.trim() || media.length > 0)
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-w-0 transition-colors duration-300 border-t shrink-0 border-border bg-surface/90 backdrop-blur-xl">
      {/* MEDIA PREVIEWS */}
      {media.length > 0 && (
        <div className="px-3 py-3 border-b border-border">
          <div className="flex w-full max-w-5xl gap-3 mx-auto overflow-x-auto scrollbar-hide">
            {media.map((item, index) => {
              const isImage = item.file.type.startsWith("image/");
              const isVideo = item.file.type.startsWith("video/");

              return (
                <div
                  key={index}
                  className="relative w-24 h-24 overflow-hidden border shadow-sm group shrink-0 rounded-2xl border-border bg-surface-secondary"
                >
                  {/* IMAGE PREVIEW */}
                  {isImage && (
                    <img
                      src={item.preview}
                      alt="preview"
                      className="object-cover w-full h-full "
                    />
                  )}

                  {/* VIDEO PREVIEW */}
                  {isVideo && (
                    <video
                      src={item.preview}
                      className="object-cover w-full h-full "
                    />
                  )}

                  {/* FILE PREVIEW (Documents/PDFs etc.) */}
                  {!isImage && !isVideo && (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2 text-center ">
                      <div className="flex items-center justify-center w-10 h-10 text-xs font-semibold text-white rounded-xl bg-accent">
                        {item.file.name?.split(".")?.pop()?.toUpperCase() ||
                          "FILE"}
                      </div>
                      <p className="line-clamp-2 break-all text-[10px] text-muted">
                        {item.file.name}
                      </p>
                    </div>
                  )}

                  {/* REMOVE ATTACHMENT BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setMedia((prev) => {
                        URL.revokeObjectURL(prev[index].preview);
                        return prev.filter((_, i) => i !== index);
                      });
                    }}
                    className="absolute flex items-center justify-center w-6 h-6 text-sm text-white transition-opacity duration-200 rounded-full opacity-100 cursor-pointer right-1 top-1 bg-black/70 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="px-3 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="flex items-end w-full max-w-5xl gap-2 mx-auto ">
          {/* INPUT WRAPPER */}
          <div className="flex items-end flex-1 overflow-hidden transition-all duration-200 border shadow-sm rounded-2xl border-border bg-surface focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
            {/* HIDDEN FILE INPUT */}
            <input
              id="media"
              name="media"
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleMediaChange}
              className="hidden"
            />

            {/* ADD MEDIA ATTACHMENT TRIGGER */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-12 h-12 transition-all duration-200 cursor-pointer shrink-0 text-muted hover:text-accent"
            >
              <FiPlus size={22} />
            </button>

            {/* TEXT BOX */}
            <input
              ref={messageInputRef}
              id="message"
              name="message"
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 py-3 pr-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted"
            />
          </div>

          {/* TRANSMIT BUTTON */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() && media.length === 0}
            className="h-12 shrink-0 rounded-2xl cursor-pointer bg-accent px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
