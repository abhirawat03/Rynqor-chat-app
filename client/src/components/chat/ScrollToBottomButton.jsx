import { FiArrowDown } from "react-icons/fi";

const ScrollToBottomButton = ({ isAtBottom, unreadCount, onClick }) => {
  if (isAtBottom) {
    return null;
  }

  return (
    <div className="absolute z-20 right-6 bottom-24">
      <button
        onClick={onClick}
        type="button"
        className="
          relative
          flex
          h-10
          w-10
          cursor-pointer
          items-center
          justify-center
          rounded-full
          border
          border-border
          bg-surface/90
          text-foreground
          shadow-lg
          backdrop-blur-md
          transition-all
          duration-200
          hover:scale-105
          hover:bg-hover
          active:scale-95
        "
      >
        <FiArrowDown size={18} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-2
              -right-1
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-accent
              text-[10px]
              font-bold
              text-white
              shadow-sm
            "
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ScrollToBottomButton;
