const TypingIndicator = () => {

  return (
    <div
      className="flex justify-start mb-2 "
    >

      <div
        className="flex w-fit items-end gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-sm"
      >

        {/* TEXT */}
        <span
          className="text-sm font-medium text-muted"
        >
          Typing
        </span>

        {/* DOTS */}
        <span
          className="w-2 h-2 rounded-full bg-muted animate-bounce"
        />

        <span
          className="h-2 w-2 rounded-full bg-muted animate-bounce [animation-delay:0.15s]"
        />

        <span
          className="h-2 w-2 rounded-full bg-muted animate-bounce [animation-delay:0.3s]"
        />

      </div>

    </div>
  );
};

export default TypingIndicator;