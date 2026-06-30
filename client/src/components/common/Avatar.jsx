import { BsPersonCircle, BsPeopleFill } from "react-icons/bs";

const Avatar = ({
  avatar,
  name,
  size = "md",
  isGroup = false,
  className = "",
  fallbackIcon,
  loading = "lazy",
  ...props
}) => {
  const url = avatar?.url || (typeof avatar === "string" ? avatar : null);
  const displayName = name || "";
  const initial = displayName.charAt(0).toUpperCase();

  // Size mapping matching the existing designs in the codebase:
  // - xs: h-4 w-4 (CreateGroupModal chips)
  // - sm: h-8 w-8 (Message component, or standard small)
  // - md: h-9 w-9 (ChatHeader or similar)
  // - lg: h-11 w-11 (ChatHeader or similar)
  // - xl: h-14 w-14 (ChatItem)
  // - xxl: h-24 w-24 (ProfilePage hero)
  // - xxxl: h-28 w-28 (UserProfilePage and GroupProfilePage hero)
  const sizeClasses = {
    xs: "h-4 w-4 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-sm",
    xl: "h-14 w-14 text-sm",
    xxl: "h-24 w-24 text-3xl",
    xxxl: "h-28 w-28 text-3xl",
  };

  const sizeClass = sizeClasses[size] || size;

  if (url) {
    return (
      <img
        src={url}
        alt={displayName}
        loading={loading}
        decoding="async"
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${className}`}
        {...props}
      />
    );
  }

  if (fallbackIcon) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-surface-secondary text-muted shrink-0 ${sizeClass} ${className}`}
        {...props}
      >
        {fallbackIcon}
      </div>
    );
  }

  if (isGroup) {
    const iconSize = size === "xxxl" ? 60 : 20;
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-surface-secondary text-muted shrink-0 ${sizeClass} ${className}`}
        {...props}
      >
        <BsPeopleFill size={iconSize} className="text-muted" />
      </div>
    );
  }

  if (displayName) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-surface-secondary text-foreground font-semibold shrink-0 select-none ${sizeClass} ${className}`}
        {...props}
      >
        <span>{initial}</span>
      </div>
    );
  }

  // Default fallback if nothing is provided
  const iconSize = size === "xxl" || size === "xxxl" ? 90 : 20;
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-surface-secondary text-muted shrink-0 ${sizeClass} ${className}`}
      {...props}
    >
      <BsPersonCircle size={iconSize} className="text-muted" />
    </div>
  );
};

export default Avatar;
