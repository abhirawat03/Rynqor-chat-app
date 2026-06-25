import {
  BsPersonCircle,
} from "react-icons/bs";

import {
  IoClose,
} from "react-icons/io5";

import {
  useState,
} from "react";

import {
  useUserQuery,
} from "../../hooks/users/useUserQuery.js";

import useConversationMedia
  from "../../hooks/conversations/useConversationMediaQuery.js";

const UserProfilePage = ({
  userId,
  isOnline,
  conversationId,
  onClose,
  onBack,
}) => {

  const {
    data: user,
    isLoading,
    isError,
  } = useUserQuery(userId);

  const {
    data: media = [],
    isLoading: mediaLoading,
  } = useConversationMedia(
    conversationId
  );

  const [
    showAvatarModal,
    setShowAvatarModal,
  ] = useState(false);

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState(null);

  // LOADING
  if (isLoading) {

    return (
      <div
        className="flex items-center justify-center w-full h-full bg-surface text-muted"
      >
        Loading profile...
      </div>
    );

  }

  // ERROR
  if (isError || !user) {

    return (
      <div
        className="flex items-center justify-center w-full h-full text-red-500 bg-surface"
      >
        User not found
      </div>
    );

  }

  return (

    <>

      <div
        className="
          scrollbar-hide

          h-full
          w-full

          overflow-y-auto

          border-l
          border-border

          bg-surface

          transition-transform
          duration-300

          xl:w-105
          max-w-full
        "
      >

        {/* HEADER */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b border-border bg-surface/90 backdrop-blur-xl"
        >

          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-hover transition-all cursor-pointer"
                title="Back to Group Profile"
              >
                &larr;
              </button>
            )}

            <div>

              <h1
                className="text-lg font-semibold text-foreground"
              >
                Contact Info
              </h1>

              <p
                className="
                  mt-0.5

                  text-xs

                  text-muted
                "
              >
                User profile
              </p>

            </div>
          </div>

          <button
            type="button"

            onClick={onClose}

            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              cursor-pointer

              rounded-xl

              text-lg

              text-muted

              transition-all
              duration-200

              hover:bg-hover
              hover:text-foreground

              active:scale-[0.96]
            "
          >

            <IoClose size={22} />

          </button>

        </div>

        {/* CONTENT */}
        <div
          className="flex-1 px-4 py-5 overflow-y-auto scrollbar-hide"
        >

          {/* PROFILE HERO */}
          <div
            className="flex flex-col items-center pb-6 border-b border-border"
          >

            {/* AVATAR */}
            <button
              type="button"

              onClick={() => {

                if (
                  user?.avatar?.url
                ) {

                  setShowAvatarModal(
                    true
                  );

                }

              }}

              className="
                transition-transform
                duration-200
                cursor-pointer

                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >

              {user.avatar?.url ? (

                <img
                  src={user.avatar.url}

                  alt={user.fullName}

                  className="object-cover rounded-full h-28 w-28 ring-4 ring-surface-secondary"
                />

              ) : (

                <div
                  className="flex items-center justify-center rounded-full h-28 w-28 bg-surface-secondary"
                >

                  <BsPersonCircle
                    size={90}

                    className=" text-muted"
                  />

                </div>

              )}

            </button>

            {/* NAME */}
            <h2
              className="mt-4 text-2xl font-bold text-foreground"
            >
              {user.fullName}
            </h2>

            {/* USERNAME */}
            <p
              className="mt-1 text-sm text-muted"
            >
              @{user.username}
            </p>

            {/* STATUS */}
            {isOnline && (

              <div
                className="flex items-center gap-2 mt-3 text-sm text-green-500 "
              >

                <div
                  className="w-2 h-2 bg-green-500 rounded-full "
                />

                Online

              </div>

            )}

          </div>

          {/* INFO */}
          <div
            className="grid gap-4 mt-6 "
          >

            {/* ABOUT */}
            <div
              className="p-5 rounded-2xl bg-background"
            >

              <p
                className="text-xs font-medium tracking-wide uppercase text-muted"
              >
                About
              </p>

              <p
                className="mt-3 text-sm leading-relaxed text-foreground"
              >
                {user?.bio || "No bio yet"}
              </p>

            </div>

          </div>

          {/* SHARED MEDIA */}
          <div
            className="mt-8 "
          >

            <h3
              className="mb-4 text-lg font-semibold text-foreground"
            >
              Shared Media
            </h3>

            {mediaLoading ? (

              <div
                className="p-6 text-sm text-center border rounded-2xl border-border bg-background text-muted"
              >
                Loading media...
              </div>

            ) : media.length === 0 ? (

              <div
                className="p-10 text-sm text-center border rounded-2xl border-border bg-background text-muted"
              >
                No shared media yet
              </div>

            ) : (

              <div
                className="grid grid-cols-3 gap-2 "
              >

                {media.map((message) =>

                  message.media?.map((item) => (

                    <div
                      key={item.publicId}

                      className="overflow-hidden border rounded-xl border-border bg-background"
                    >

                      {/* IMAGE */}
                      {item.type === "image" && (

                        <button
                          type="button"

                          onClick={() =>
                            setSelectedMedia(item)
                          }

                          className="block w-full h-full "
                        >

                          <img
                            src={item.url}

                            alt={
                              item.name || "media"
                            }
                            loading="lazy"
                            decoding="async"
                            className="object-cover w-full h-full transition-transform duration-300 cursor-pointer aspect-square hover:scale-105"
                          />

                        </button>

                      )}

                      {/* VIDEO */}
                      {item.type === "video" && (

                        <button
                          type="button"

                          onClick={() =>
                            setSelectedMedia(item)
                          }

                          className="relative block w-full h-full overflow-hidden cursor-pointer group"
                        >

                          <video
                            src={item.url}
                            preload="metadata"

                            className="object-cover w-full h-full aspect-square"
                          />

                          {/* OVERLAY */}
                          <div
                            className="absolute inset-0 flex items-center justify-center transition-colors duration-200 bg-black/30 group-hover:bg-black/40"
                          >

                            <div
                              className="flex items-center justify-center w-12 h-12 text-xl rounded-full bg-white/90"
                            >
                              ▶
                            </div>

                          </div>

                        </button>

                      )}

                      {/* AUDIO */}
                      {item.type === "audio" && (

                        <button
                          type="button"

                          onClick={() =>
                            setSelectedMedia(item)
                          }

                          className="relative flex flex-col items-center justify-center w-full gap-3 p-4 overflow-hidden cursor-pointer group aspect-square bg-linear-to-br from-zinc-800 to-zinc-900"
                        >

                          {/* ICON */}
                          <div
                            className="flex items-center justify-center text-2xl text-white transition-transform duration-200 rounded-full h-14 w-14 bg-white/10 group-hover:scale-110"
                          >
                            🎵
                          </div>

                          {/* NAME */}
                          <p
                            className="max-w-full text-xs text-center line-clamp-2 text-white/90"
                          >
                            {item.name || "Audio"}
                          </p>

                        </button>

                      )}

                      {/* FILE */}
                      {item.type === "file" && (

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          title={item.name}
                          className="flex flex-col items-center justify-center gap-2 p-3 text-center transition-colors duration-200 hover:bg-hover min-h-24 h-full w-full"
                        >

                          <div
                            className="text-4xl "
                          >
                            📄
                          </div>

                          <p
                            className="text-xs text-foreground break-all"
                          >
                            {item.name || "File"}
                          </p>

                        </a>

                      )}

                    </div>

                  ))
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* AVATAR MODAL */}
      {showAvatarModal && (

        <div
          onClick={() =>
            setShowAvatarModal(false)
          }

          className="
            fixed
            inset-0
            z-100

            flex
            items-center
            justify-center

            bg-black/90

            p-4

            backdrop-blur-sm
          "
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            className="relative overflow-hidden shadow-2xl rounded-3xl"
          >

            <img
              src={user?.avatar?.url}

              alt={user?.fullName}

              className="
                max-h-[90vh]
                max-w-[90vw]

                object-contain
              "
            />

          </div>

        </div>

      )}

      {/* MEDIA MODAL */}
      {selectedMedia && (

        <div
          onClick={() =>
            setSelectedMedia(null)
          }

          className="
      fixed
      inset-0
      z-120

      flex
      items-center
      justify-center

      bg-black/90

      p-4

      backdrop-blur-sm
    "
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            className="
        relative

        max-h-[90vh]
        max-w-[90vw]

        overflow-hidden

        rounded-3xl

        bg-background

        shadow-2xl
      "
          >

            {/* IMAGE */}
            {selectedMedia.type === "image" && (

              <img
                src={selectedMedia.url}

                alt={selectedMedia.name}

                className="
            max-h-[90vh]
            max-w-[90vw]

            object-contain
          "
              />

            )}

            {/* VIDEO */}
            {selectedMedia.type === "video" && (

              <video
                src={selectedMedia.url}

                controls
                autoPlay

                className="
            max-h-[90vh]
            max-w-[90vw]
          "
              />

            )}

            {/* AUDIO */}
            {selectedMedia.type === "audio" && (

              <div
                className="
            flex
            min-w-[320px]
            flex-col
            gap-4

            p-6
          "
              >

                <p
                  className="text-sm font-medium text-foreground"
                >
                  {selectedMedia.name}
                </p>

                <audio
                  controls
                  autoPlay
                  src={selectedMedia.url}
                />

              </div>

            )}

            {/* CLOSE */}
            <button
              type="button"

              onClick={() =>
                setSelectedMedia(null)
              }

              className="absolute flex items-center justify-center w-10 h-10 text-xl text-white transition-all duration-200 rounded-full cursor-pointer right-3 top-3 bg-black/50 backdrop-blur-md hover:bg-black/70"
            >

              ✕

            </button>

          </div>

        </div>

      )}

    </>
  );

};

export default UserProfilePage;