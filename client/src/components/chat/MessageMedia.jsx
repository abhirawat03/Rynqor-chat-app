import { memo } from "react";
const MessageMedia = memo(({ item, mediaWidth, setPreview }) => {
  const isUploading = item.uploading;

  // -----------------------------------
  // OPEN PREVIEW
  // -----------------------------------

  const handlePreview = (type) => {
    if (isUploading) {
      return;
    }

    setPreview({
      type,
      url: item.url,
      name: item.name,
    });
  };

  // -----------------------------------
  // FILE EXTENSION
  // -----------------------------------

  const extension = item.name?.split(".")?.pop()?.toUpperCase();

  // -----------------------------------
  // UPLOAD OVERLAY
  // -----------------------------------

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = item.uploadProgress ?? 0;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const UploadOverlay = isUploading && (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm select-none">
      {/* CIRCULAR PROGRESS TRACK */}
      <div className="relative flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-white/20 fill-transparent"
            strokeWidth="3.5"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-white fill-transparent transition-all duration-300"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-white tracking-tighter">
          {progress}%
        </span>
      </div>

      {/* TEXT */}
      <p className="mt-2 text-[10px] font-medium text-white/90">Uploading...</p>
    </div>
  );

  // -----------------------------------
  // IMAGE
  // -----------------------------------

  if (item.type === "image") {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={item.url}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onClick={() => handlePreview("image")}
          className={`
            ${mediaWidth}

            max-h-72

            cursor-pointer

            rounded-2xl

            object-cover

            transition-transform
            duration-300

            hover:scale-[1.02]
          `}
        />

        {UploadOverlay}
      </div>
    );
  }

  // -----------------------------------
  // VIDEO
  // -----------------------------------

  if (item.type === "video") {
    return (
      <div
        onClick={() => handlePreview("video")}
        className="relative overflow-hidden cursor-pointer group rounded-2xl"
      >
        <video
          preload="metadata"
          className={`
            ${mediaWidth}

            max-h-72

            rounded-2xl

            object-cover
          `}
        >
          <source src={item.url} />
        </video>

        {/* PLAY ICON */}
        <div className="absolute inset-0 flex items-center justify-center transition-colors duration-300 bg-black/20 group-hover:bg-black/30">
          <div className="flex items-center justify-center w-12 h-12 text-lg text-black transition-transform duration-300 rounded-full shadow-lg bg-white/90 backdrop-blur-sm group-hover:scale-105">
            ▶
          </div>
        </div>

        {UploadOverlay}
      </div>
    );
  }

  // -----------------------------------
  // AUDIO
  // -----------------------------------

  if (item.type === "audio") {
    return (
      <div className="relative ">
        <div
          onClick={() => handlePreview("audio")}
          className="flex items-center gap-3 p-3 transition-all duration-200 border cursor-pointer rounded-2xl border-border bg-surface hover:bg-hover"
        >
          {/* ICON */}
          <div className="flex items-center justify-center text-white rounded-full h-11 w-11 shrink-0 bg-accent">
            🎵
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-w-0 ">
            <p className="text-sm font-medium truncate text-foreground">
              {item.name || "Audio"}
            </p>

            {/* WAVE */}
            <div className="h-1 mt-2 overflow-hidden rounded-full bg-hover">
              <div className="w-1/3 h-full rounded-full bg-accent" />
            </div>
          </div>
        </div>

        {UploadOverlay}
      </div>
    );
  }

  // -----------------------------------
  // FILE
  // -----------------------------------

  return (
    <div
      onClick={() => {
        if (isUploading) {
          return;
        }

        window.open(item.url, "_blank", "noopener,noreferrer");
      }}
      className={`
        ${mediaWidth}

        group

        relative

        cursor-pointer

        overflow-hidden
        rounded-2xl

        border
        border-border

        bg-surface

        shadow-sm

        transition-all
        duration-300

        hover:bg-hover
        hover:shadow-md
      `}
    >
      {/* TOP */}
      <div className="flex items-center gap-3 p-4 ">
        {/* EXTENSION */}
        <div className="flex items-center justify-center text-xs font-semibold text-white h-11 w-11 shrink-0 rounded-xl bg-accent">
          {extension || "FILE"}
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0 ">
          <p className="text-sm font-semibold truncate text-foreground">
            {item.name}
          </p>

          <p className="mt-1 text-xs text-muted">Tap to open</p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background/60">
        <span className="text-xs text-muted">Document</span>

        <div className="text-sm transition-transform duration-200 text-foreground group-hover:translate-x-1">
          ↗
        </div>
      </div>

      {UploadOverlay}
    </div>
  );
});

export default MessageMedia;
