const SearchCard = ({
  avatar,
  username,
  fullName,
  bio,
  onClick,
  isLoading
}) => {

  const firstLetter =
    fullName
      ?.charAt(0)
      ?.toUpperCase() ||
    username
      ?.charAt(0)
      ?.toUpperCase() ||
    "?";

  return (
    <button
  type="button"
  onClick={onClick}
  disabled={isLoading}
  className={`
    group

    flex
    w-full

    items-center
    cursor-pointer
    gap-3

    rounded-2xl
    border border-border
    bg-surface

    p-3 sm:p-4
    text-left
    shadow-sm

    transition-all duration-200

    ${
      isLoading
        ? `
            cursor-not-allowed
            opacity-60
          `
        : `
            cursor-pointer
            hover:bg-hover
            hover:shadow-md
            active:scale-[0.98]
          `
    }
  `}
>

      {/* AVATAR */}
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center

          overflow-hidden
          rounded-full

          bg-surface-secondary

          text-lg
          font-semibold

          text-foreground
        "
      >

        {avatar ? (

          <img
            src={avatar.url}
            alt={fullName}
            loading="lazy"
            decoding="async"
            className="
              h-full
              w-full
              object-cover
            "
          />

        ) : (

          firstLetter

        )}

      </div>

      {/* INFO */}
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
          {fullName}
        </p>

        {/* USERNAME */}
        <p
          className="
            truncate

            text-sm

            text-muted
          "
        >
          @{username}
        </p>
        {bio && (
          <p
            className="
              mt-1
              line-clamp-2

              text-xs
              text-muted
            "
          >
            {bio}
          </p>
        )}

      </div>

    </button>
  );
};

export default SearchCard;