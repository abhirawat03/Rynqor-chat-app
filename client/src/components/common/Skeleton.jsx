export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`}
      {...props}
    />
  );
};

// Skeleton loader for a single sidebar ChatItem
export const ChatItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-transparent">
      {/* Avatar circular skeleton */}
      <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      {/* Content text skeletons */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          {/* Name skeleton */}
          <Skeleton className="h-4 w-28 rounded-md" />
          {/* Time skeleton */}
          <Skeleton className="h-3 w-8 rounded-md shrink-0" />
        </div>
        {/* Preview text skeleton */}
        <Skeleton className="mt-2.5 h-3 w-3/4 rounded-md" />
      </div>
    </div>
  );
};

// Skeleton loader for the sidebar ChatItems list
export const ChatListSkeleton = ({ count = 6 }) => {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: count }).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </div>
  );
};

// Skeleton loader for individual messages
export const MessageSkeleton = ({ isOwn = false }) => {
  return (
    <div className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-3 py-2.5 rounded-2xl shadow-sm border border-transparent ${
          isOwn
            ? "bg-accent/8 dark:bg-accent/4"
            : "border-border bg-surface/50 dark:bg-surface/30"
        }`}
        style={{ width: "240px" }}
      >
        {/* Text lines */}
        <Skeleton
          className={`h-3.5 w-full rounded-md ${isOwn ? "bg-accent/15 dark:bg-accent/8" : ""}`}
        />
        <Skeleton
          className={`mt-2 h-3.5 w-2/3 rounded-md ${isOwn ? "bg-accent/15 dark:bg-accent/8" : ""}`}
        />
        {/* Footer time */}
        <div className="mt-2 flex justify-end">
          <Skeleton
            className={`h-2.5 w-8 rounded-md ${isOwn ? "bg-accent/10 dark:bg-accent/6" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for the main MessageList pane
export const MessageListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col p-4 gap-2 flex-1 justify-end min-h-0">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isOwn={index % 3 === 0} />
      ))}
    </div>
  );
};

// Skeleton loader for the entire ConversationPage view
export const ConversationSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Message List Skeleton */}
      <MessageListSkeleton count={6} />

      {/* Input Skeleton */}
      <div className="p-3 bg-surface/30 border-t border-border flex items-center gap-2 shrink-0">
        <Skeleton className="h-10 flex-1 rounded-2xl" />
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      </div>
    </div>
  );
};

// Skeleton loader for the SearchPage view
export const SearchSkeleton = () => {
  return (
    <div className="flex justify-center flex-1 px-4 py-4 pb-20 overflow-hidden bg-surface md:pb-4 animate-fadeIn">
      <div className="flex flex-col w-full h-full max-w-2xl">
        {/* Header Skeleton */}
        <div className="hidden mb-4 md:block">
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="mt-2.5 h-3.5 w-60 rounded-md" />
        </div>

        {/* Search Container Skeleton */}
        <div className="flex flex-col flex-1 overflow-hidden border rounded-3xl border-border bg-background">
          <div className="p-3 border-b shrink-0 border-border">
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
          <div className="flex-1 p-3 space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface/50"
              >
                <Skeleton className="h-11 w-11 rounded-full shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md animate-pulse" />
                  <Skeleton className="h-3 w-48 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for the ProfilePage (Settings) view
export const SettingsSkeleton = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-surface animate-fadeIn">
      <div className="max-w-3xl px-4 py-6 mx-auto md:px-8">
        {/* Header Skeleton */}
        <div className="pb-6 border-b border-border">
          <Skeleton className="h-8 w-44 rounded-md" />
          <Skeleton className="mt-2.5 h-3.5 w-72 rounded-md" />
        </div>

        {/* Form sections Skeletons */}
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full animate-pulse" />
            <Skeleton className="h-8 w-28 rounded-xl animate-pulse" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-md animate-pulse" />
                <Skeleton className="h-11 w-full rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
