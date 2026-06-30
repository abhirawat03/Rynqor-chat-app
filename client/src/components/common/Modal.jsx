import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
  raw = false,
}) => {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    xxl: "max-w-2xl",
    full: "max-w-full",
  };

  const sizeClass = sizeClasses[size] || size;

  if (raw) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative overflow-hidden shadow-2xl rounded-3xl ${className}`}
        >
          {children}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute flex items-center justify-center w-10 h-10 text-xl text-white transition-all duration-200 rounded-full cursor-pointer right-3 top-3 bg-black/50 backdrop-blur-md hover:bg-black/70"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${sizeClass} bg-surface border border-border rounded-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden ${className}`}
      >
        {/* HEADER */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {title || ""}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-hover text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
              >
                <IoClose size={20} />
              </button>
            )}
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
