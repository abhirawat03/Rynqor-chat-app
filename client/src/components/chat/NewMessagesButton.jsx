const NewMessagesButton = ({
    count,
    onClick,
}) => {

    if (!count) {
        return null;
    }

    return (
        <div
            className="
        absolute
        bottom-24
        left-1/2
        z-20

        -translate-x-1/2
      "
        >
            <button
                onClick={onClick}
                className="
          rounded-full

          bg-surface-secondary
          px-4
          py-2

          text-sm
          font-medium
          text-primary-foreground

          shadow-lg

          transition-all
          duration-200

          hover:scale-105
        "
            >
                ↓ {count} new messages
            </button>
        </div>
    );
};

export default NewMessagesButton;