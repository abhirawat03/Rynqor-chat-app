import Modal from "./Modal.jsx";

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
  const isDanger = type === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* BODY */}
      <div className="-mt-2 mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border -mx-6 -mb-6 px-6 py-4 bg-surface-secondary">
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
    </Modal>
  );
};

export default ConfirmModal;
