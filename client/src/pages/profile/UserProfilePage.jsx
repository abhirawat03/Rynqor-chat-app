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
        className="
          flex
          h-full
          w-full
          items-center
          justify-center

          bg-surface

          text-muted
        "
      >
        Loading profile...
      </div>
    );

  }

  // ERROR
  if (isError || !user) {

    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center

          bg-surface

          text-red-500
        "
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

          xl:w-[420px]
          max-w-full
        "
      >

        {/* HEADER */}
        <div
          className="
            sticky
            top-0
            z-10

            flex
            items-center
            justify-between

            border-b
            border-border

            bg-surface/90

            px-4
            py-4

            backdrop-blur-xl
          "
        >

          <div>

            <h1
              className="
                text-lg
                font-semibold

                text-foreground
              "
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

          <button
            type="button"

            onClick={onClose}

            className="
              flex
              h-10
              w-10
              items-center
              justify-center

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
          className="
            scrollbar-hide

            flex-1

            overflow-y-auto

            px-4
            py-5
          "
        >

          {/* PROFILE HERO */}
          <div
            className="
              flex
              flex-col
              items-center

              border-b
              border-border

              pb-6
            "
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

                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >

              {user.avatar?.url ? (

                <img
                  src={user.avatar.url}

                  alt={user.fullName}

                  className="
                    h-28
                    w-28

                    rounded-full
                    object-cover

                    ring-4
                    ring-surface-secondary
                  "
                />

              ) : (

                <div
                  className="
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center

                    rounded-full

                    bg-surface-secondary
                  "
                >

                  <BsPersonCircle
                    size={90}

                    className="
                      text-muted
                    "
                  />

                </div>

              )}

            </button>

            {/* NAME */}
            <h2
              className="
                mt-4

                text-2xl
                font-bold

                text-foreground
              "
            >
              {user.fullName}
            </h2>

            {/* USERNAME */}
            <p
              className="
                mt-1

                text-sm

                text-muted
              "
            >
              @{user.username}
            </p>

            {/* STATUS */}
            {isOnline && (

              <div
                className="
                  mt-3

                  flex
                  items-center
                  gap-2

                  text-sm

                  text-green-500
                "
              >

                <div
                  className="
                    h-2
                    w-2

                    rounded-full

                    bg-green-500
                  "
                />

                Online

              </div>

            )}

          </div>

          {/* INFO */}
          <div
            className="
              mt-6

              grid
              gap-4
            "
          >

            {/* ABOUT */}
            <div
              className="
                rounded-2xl

                bg-background

                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  uppercase

                  tracking-wide

                  text-muted
                "
              >
                About
              </p>

              <p
                className="
                  mt-3

                  text-sm
                  leading-relaxed

                  text-foreground
                "
              >
                {user?.bio || "No bio yet"}
              </p>

            </div>

          </div>

          {/* SHARED MEDIA */}
          <div
            className="
              mt-8
            "
          >

            <h3
              className="
                mb-4

                text-lg
                font-semibold

                text-foreground
              "
            >
              Shared Media
            </h3>

            {mediaLoading ? (

              <div
                className="
                  rounded-2xl

                  border
                  border-border

                  bg-background

                  p-6

                  text-center

                  text-sm

                  text-muted
                "
              >
                Loading media...
              </div>

            ) : media.length === 0 ? (

              <div
                className="
                  rounded-2xl

                  border
                  border-border

                  bg-background

                  p-10

                  text-center

                  text-sm

                  text-muted
                "
              >
                No shared media yet
              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                {media.map((message) =>

                  message.media?.map((item) => (

                    <div
                      key={item.publicId}

                      className="
                        overflow-hidden

                        rounded-xl

                        border
    border-border

    bg-background
                      "
                    >

                      {/* IMAGE */}
                      {item.type === "image" && (

                        <button
                          type="button"

                          onClick={() =>
                            setSelectedMedia(item)
                          }

                          className="
                            block
                            h-full
                            w-full
                          "
                        >

                          <img
                            src={item.url}

                            alt={
                              item.name || "media"
                            }

                            className="
                              aspect-square
                              h-full
                              w-full

                              object-cover

                              transition-transform
                              duration-300

                              hover:scale-105
                            "
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

    className="
      group
      relative

      block
      h-full
      w-full

      overflow-hidden
    "
  >

    <video
      src={item.url}

      className="
        aspect-square
        h-full
        w-full

        object-cover
      "
    />

    {/* OVERLAY */}
    <div
      className="
        absolute
        inset-0

        flex
        items-center
        justify-center

        bg-black/30

        transition-colors
        duration-200

        group-hover:bg-black/40
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-full

          bg-white/90

          text-xl
        "
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

    className="
      group
      relative

      flex
      aspect-square
      w-full
      flex-col
      items-center
      justify-center
      gap-3

      overflow-hidden

      bg-gradient-to-br
      from-zinc-800
      to-zinc-900

      p-4
    "
  >

    {/* ICON */}
    <div
      className="
        flex
        h-14
        w-14
        items-center
        justify-center

        rounded-full

        bg-white/10

        text-2xl
        text-white

        transition-transform
        duration-200

        group-hover:scale-110
      "
    >
      🎵
    </div>

    {/* NAME */}
    <p
      className="
        line-clamp-2
        max-w-full

        text-center
        text-xs

        text-white/90
      "
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

  className="
    flex
    aspect-square
    flex-col
    items-center
    justify-center
    gap-2

    p-3

    text-center

    transition-colors
    duration-200

    hover:bg-hover
  "
>

  <div
    className="
      text-4xl
    "
  >
    📄
  </div>

  <p
    className="
      line-clamp-2

      text-xs

      text-foreground
    "
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
            z-[100]

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

              overflow-hidden

              rounded-3xl

              shadow-2xl
            "
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
      z-[120]

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
            className="
              text-sm
              font-medium

              text-foreground
            "
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

        className="
          absolute
          right-3
          top-3

          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-full

          bg-black/50

          text-xl
          text-white

          backdrop-blur-md

          transition-all
          duration-200

          hover:bg-black/70
        "
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