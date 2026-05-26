import { useNavigate } from "react-router-dom";

import { FaCircle } from "react-icons/fa";

const ChatHeader = ({
  name,
  isOnline,
  avatar,
  isSelf,
  profileId,
  onOpenProfile,
}) => {

  const navigate =
    useNavigate();

  return (
    <div
      className="
        shrink-0

        flex
        items-center
        gap-3

        border-b
        border-border

        bg-surface/90

        px-3
        py-3

        text-foreground

        backdrop-blur-xl

        transition-colors
        duration-300
      "
    >

      {/* BACK BUTTON */}
      <button
        className="
          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-xl

          text-xl

          text-muted

          transition-all
          duration-200

          hover:bg-hover
          hover:text-foreground

          active:scale-[0.96]

          md:hidden
        "
        onClick={() =>
          navigate(-1)
        }
      >
        ←
      </button>
<button
  onClick={() => {

    if (profileId) {
  onOpenProfile();
}

  }}

  className="
    flex
    min-w-0
    flex-1
    items-center
    gap-3

    text-left
  "
>
      {/* AVATAR */}
      <div
        className="
          relative

          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center

          overflow-hidden
          rounded-full

          bg-surface-secondary

          text-sm
          font-bold

          text-foreground
        "
      >

        {avatar ? (

          <img
            src={avatar?.url}
            alt={name}
            className="
              h-full
              w-full
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

        {/* ONLINE DOT */}
        {/* {!isSelf &&
          isOnline && (

            <div
              className="
                absolute
                bottom-0
                right-0

                flex
                h-4
                w-4
                items-center
                justify-center

                rounded-full

                border-2
                border-surface

                bg-green-500
              "
            >

              <FaCircle
                className="
                  text-[8px]
                  text-green-500
                "
              />

            </div>

          )} */}

      </div>

      {/* USER INFO */}
      <div
        className="
          min-w-0
          flex-1
        "
      >

        {/* NAME */}
        <p
          className="
            truncate

            text-sm
            font-semibold

            text-foreground
          "
        >
          {name || "Unknown"}
        </p>

        {/* STATUS */}
        {!isSelf && (

          <div
            className="
              mt-0.5

              flex
              items-center
              gap-1

              text-xs

              text-muted
            "
          >

            {isOnline ? (
              <>
                <FaCircle
                  className="
                    text-[8px]
                    text-green-500
                  "
                />

                <span>
                  Online
                </span>
              </>
            ) : (
              <span>
                Offline
              </span>
            )}

          </div>

        )}

      </div>
      </button>

    </div>
  );
};

export default ChatHeader;