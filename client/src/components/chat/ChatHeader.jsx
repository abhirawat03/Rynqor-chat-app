import { useNavigate } from "react-router-dom";

import { FaCircle } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import { formatLastSeen } from "../../utils/date.js";

const ChatHeader = ({
  name,
  isOnline,
  lastSeen,
  avatar,
  isSelf,
  isGroup,
  isDeleted = false,
  profileId,
  onOpenProfile,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 px-3 py-3 transition-colors duration-300 border-b shrink-0 border-border bg-surface/90 text-foreground backdrop-blur-xl">
      {/* BACK BUTTON */}
      <button
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          cursor-pointer

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
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <button
        onClick={() => {
          if (profileId && !isDeleted) {
            onOpenProfile();
          }
        }}
        className={`flex items-center flex-1 min-w-0 gap-3 text-left ${
          isDeleted
            ? "pointer-events-none cursor-default"
            : "cursor-pointer lg:pointer-events-none lg:cursor-default"
        }`}
      >
        {/* AVATAR */}
        <div className="relative flex items-center justify-center overflow-hidden text-sm font-bold rounded-full h-11 w-11 shrink-0 bg-surface-secondary text-foreground">
          {avatar ? (
            <img
              src={avatar?.url}
              alt={name}
              className="object-cover w-full h-full border-2 rounded-full border-border"
            />
          ) : (
            <span>{name?.charAt(0)?.toUpperCase() || "?"}</span>
          )}

          {/* ONLINE DOT */}
          {/* {!isSelf &&
          isOnline && (

            <div
              className="absolute bottom-0 right-0 flex items-center justify-center w-4 h-4 bg-green-500 border-2 rounded-full border-surface"
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
        <div className="flex-1 min-w-0 ">
          {/* NAME */}
          <p className="text-sm font-semibold truncate text-foreground">
            {name || "Unknown"}
          </p>

          {/* STATUS */}
          {!isSelf && !isGroup && (
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
              {isDeleted ? (
                <span className="italic text-muted/60">Account deleted</span>
              ) : isOnline ? (
                <>
                  <FaCircle
                    className="
                    text-[8px]
                    text-green-500
                  "
                  />

                  <span>Online</span>
                </>
              ) : (
                <span>{formatLastSeen(lastSeen)}</span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* INFO BUTTON — hidden for deleted accounts */}
      {profileId && !isDeleted && (
        <button
          type="button"
          onClick={onOpenProfile}
          className="
            hidden
            lg:flex
            h-10
            w-10
            items-center
            justify-center
            cursor-pointer

            rounded-xl

            text-xl

            text-muted

            transition-all
            duration-200

            hover:bg-hover
            hover:text-foreground

            active:scale-[0.96]
          "
          title="Open Profile"
        >
          <IoInformationCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
