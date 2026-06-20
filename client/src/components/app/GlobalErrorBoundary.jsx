import { useRouteError, useNavigate } from "react-router-dom";

const GlobalErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  if (import.meta.env.MODE !== "production") {
    console.error("GlobalErrorBoundary caught an error:", error);
  }

  const handleGoHome = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      id="global-error-boundary"
      className="
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        bg-background
        px-6
        text-center
        text-foreground
        transition-colors
        duration-300
      "
    >
      <div
        className="
          w-full
          max-w-md
          space-y-6
          rounded-3xl
          border
          border-border
          bg-surface/90
          p-8
          shadow-xl
          backdrop-blur-xl
        "
      >
        {/* WARNING ICON */}
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-red-500/10
            text-red-500
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* DETAILS */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted">
            An unexpected error has occurred in the application.
          </p>
          {error && (
            <pre
              className="
                mt-4
                max-h-32
                overflow-auto
                rounded-xl
                border
                border-border
                bg-background/50
                p-3
                text-left
                text-xs
                font-mono
                text-red-500
                scrollbar-hide
              "
            >
              {error.message || error.statusText || String(error)}
            </pre>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              cursor-pointer
              rounded-2xl
              bg-accent
              px-5
              py-3
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:brightness-110
              active:scale-[0.98]
            "
          >
            Reload Page
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="
              cursor-pointer
              rounded-2xl
              border
              border-border
              bg-surface
              px-5
              py-3
              text-sm
              font-medium
              text-foreground
              shadow-sm
              transition-all
              duration-200
              hover:bg-hover
              active:scale-[0.98]
            "
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorBoundary;
