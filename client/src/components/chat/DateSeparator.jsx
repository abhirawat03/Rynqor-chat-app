const DateSeparator = ({
  label,
}) => {

  return (
    <div
      className="
        flex
        justify-center

        py-3
      "
    >
      <div
        className="
          rounded-full

          bg-surface-secondary

          px-3
          py-1

          text-xs
          text-muted-foreground

          shadow-sm
        "
      >
        {label}
      </div>
    </div>
  );

};

export default DateSeparator;