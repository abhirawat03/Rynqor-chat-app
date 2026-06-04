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
        className="flex items-center justify-center w-12 h-12 overflow-hidden text-lg font-semibold rounded-full shrink-0 bg-surface-secondary text-foreground"
      >

        {avatar ? (

          <img
            src={avatar.url}
            alt={fullName}
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full "
          />

        ) : (

          firstLetter

        )}

      </div>

      {/* INFO */}
      <div
        className="flex-1 min-w-0 "
      >

        {/* NAME */}
        <p
          className="text-sm font-semibold truncate text-foreground"
        >
          {fullName}
        </p>

        {/* USERNAME */}
        <p
          className="text-sm truncate text-muted"
        >
          @{username}
        </p>
        {bio && (
          <p
            className="mt-1 text-xs line-clamp-2 text-muted"
          >
            {bio}
          </p>
        )}

      </div>

    </button>
  );
};

export default SearchCard;