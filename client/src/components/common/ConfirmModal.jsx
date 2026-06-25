import { IoClose } from "react-icons/io5";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "primary",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface border border-border rounded-3xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-md font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-hover text-muted hover:text-foreground transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-secondary">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-hover transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-accent hover:opacity-90"
            }`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
