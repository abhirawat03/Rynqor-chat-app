const NewMessagesButton = ({
    count,
    onClick,
}) => {

    if (!count) {
        return null;
    }

    return (
        <div
            className="absolute z-20 -translate-x-1/2 bottom-24 left-1/2"
        >
            <button
                onClick={onClick}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full shadow-lg bg-surface-secondary text-primary-foreground hover:scale-105"
            >
                ↓ {count} new messages
            </button>
        </div>
    );
};

export default NewMessagesButton;