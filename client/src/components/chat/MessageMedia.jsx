import { memo } from "react";
const MessageMedia = memo(({
  item,
  mediaWidth,
  setPreview,
}) => {

  const isUploading =
    item.uploading;

  // -----------------------------------
  // OPEN PREVIEW
  // -----------------------------------

  const handlePreview = (
    type
  ) => {

    if (
      isUploading
    ) {
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

  const extension =
    item.name
      ?.split(".")
      ?.pop()
      ?.toUpperCase();

  // -----------------------------------
  // UPLOAD OVERLAY
  // -----------------------------------

  const UploadOverlay =
    isUploading && (

      <div
        className="
          absolute
          inset-0
          z-20

          flex
          flex-col
          items-center
          justify-center

          bg-black/65

          backdrop-blur-sm
        "
      >

        {/* SPINNER */}
        <div
          className="
            h-8
            w-8

            animate-spin

            rounded-full

            border-2
            border-white/20
            border-t-white
          "
        />

        {/* TEXT */}
        <p
          className="
            mt-3

            text-xs
            font-medium

            text-white
          "
        >
          Uploading...
        </p>

      </div>

    );

  // -----------------------------------
  // IMAGE
  // -----------------------------------

  if (
    item.type === "image"
  ) {

    return (

      <div
        className="
          relative

          overflow-hidden
          rounded-2xl
        "
      >

        <img
          src={item.url}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onClick={() =>
            handlePreview(
              "image"
            )
          }

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

  if (
    item.type === "video"
  ) {

    return (

      <div
        onClick={() =>
          handlePreview(
            "video"
          )
        }

        className="
          group

          relative

          cursor-pointer

          overflow-hidden
          rounded-2xl
        "
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
        <div
          className="
            absolute
            inset-0

            flex
            items-center
            justify-center

            bg-black/20

            transition-colors
            duration-300

            group-hover:bg-black/30
          "
        >

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-full

              bg-white/90

              text-lg
              text-black

              shadow-lg

              backdrop-blur-sm

              transition-transform
              duration-300

              group-hover:scale-105
            "
          >
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

  if (
    item.type === "audio"
  ) {

    return (

      <div
        className="
          relative
        "
      >

        <div
          onClick={() =>
            handlePreview(
              "audio"
            )
          }

          className="
            flex
            items-center
            gap-3

            cursor-pointer

            rounded-2xl

            border
            border-border

            bg-surface

            p-3

            transition-all
            duration-200

            hover:bg-hover
          "
        >

          {/* ICON */}
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center

              rounded-full

              bg-accent

              text-white
            "
          >
            🎵
          </div>

          {/* CONTENT */}
          <div
            className="
              min-w-0
              flex-1
            "
          >

            <p
              className="
                truncate

                text-sm
                font-medium

                text-foreground
              "
            >
              {item.name || "Audio"}
            </p>

            {/* WAVE */}
            <div
              className="
                mt-2

                h-1

                overflow-hidden
                rounded-full

                bg-hover
              "
            >

              <div
                className="
                  h-full
                  w-1/3

                  rounded-full

                  bg-accent
                "
              />

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

        if (
          isUploading
        ) {
          return;
        }

        window.open(
          item.url,
          "_blank",
          "noopener,noreferrer"
        );

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
      <div
        className="
          flex
          items-center
          gap-3

          p-4
        "
      >

        {/* EXTENSION */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-xl

            bg-accent

            text-xs
            font-semibold

            text-white
          "
        >
          {extension || "FILE"}
        </div>

        {/* INFO */}
        <div
          className="
            min-w-0
            flex-1
          "
        >

          <p
            className="
              truncate

              text-sm
              font-semibold

              text-foreground
            "
          >
            {item.name}
          </p>

          <p
            className="
              mt-1

              text-xs

              text-muted
            "
          >
            Tap to open
          </p>

        </div>

      </div>

      {/* BOTTOM */}
      <div
        className="
          flex
          items-center
          justify-between

          border-t
          border-border

          bg-background/60

          px-4
          py-2
        "
      >

        <span
          className="
            text-xs

            text-muted
          "
        >
          Document
        </span>

        <div
          className="
            text-sm

            text-foreground

            transition-transform
            duration-200

            group-hover:translate-x-1
          "
        >
          ↗
        </div>

      </div>

      {UploadOverlay}

    </div>

  );

});

export default MessageMedia;