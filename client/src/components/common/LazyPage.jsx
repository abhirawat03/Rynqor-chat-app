import { Suspense } from "react";
import { Skeleton } from "./Skeleton";

export const PageLoader = () => (
  <div className="flex flex-1 flex-col h-full w-full bg-background p-6 space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center gap-3 border-b border-border pb-4 shrink-0">
      <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28 rounded-md animate-pulse" />
      </div>
    </div>
    {/* Content Area Skeleton */}
    <div className="flex-1 space-y-4">
      <Skeleton className="h-36 w-full rounded-2xl animate-pulse" />
      <Skeleton className="h-24 w-3/4 rounded-2xl animate-pulse" />
      <Skeleton className="h-28 w-5/6 rounded-2xl animate-pulse" />
    </div>
  </div>
);

export const LazyPage = ({ children, fallback }) => (
  <Suspense fallback={fallback || <PageLoader />}>{children}</Suspense>
);
