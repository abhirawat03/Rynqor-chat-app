export const getDateLabel = (date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const day = messageDate.getDate();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[messageDate.getMonth()];
  const year = messageDate.getFullYear();

  return `${day} ${month} ${year}`;
};

export const getRelativeTimeShort = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  if (diffMs < 0) return "now";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) {
    return "now";
  }
  if (diffHours < 1) {
    return `${diffMins}m`;
  }
  if (diffDays < 1) {
    return `${diffHours}h`;
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  if (diffDays < 30) {
    return `${diffWeeks}w`;
  }
  if (diffDays < 365) {
    return `${diffMonths}mo`;
  }
  return `${diffYears}y`;
};

export const formatLastSeen = (date) => {
  if (!date) return "Offline";
  const now = new Date();
  const past = new Date(date);

  // Time format: e.g. "4:32 PM"
  let hours = past.getHours();
  const minutes = past.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const timeStr = `${hours}:${minutes} ${ampm}`;

  const diffMs = now - past;
  if (diffMs < 0) return "last seen recently";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffMins < 1) {
    return "last seen recently";
  }

  // Today
  if (now.toDateString() === past.toDateString()) {
    return `last seen today at ${timeStr}`;
  }

  // Yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === past.toDateString()) {
    return `last seen yesterday at ${timeStr}`;
  }

  // Older
  const day = past.getDate().toString().padStart(2, "0");
  const month = (past.getMonth() + 1).toString().padStart(2, "0");
  const year = past.getFullYear();
  return `last seen ${day}/${month}/${year}`;
};
