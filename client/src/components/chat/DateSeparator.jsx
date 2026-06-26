const DateSeparator = ({ label }) => {
  return (
    <div className="flex justify-center py-3 ">
      <div className="px-3 py-1 text-xs rounded-full shadow-sm bg-surface-secondary text-muted-foreground">
        {label}
      </div>
    </div>
  );
};

export default DateSeparator;
