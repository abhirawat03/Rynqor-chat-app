import {
  IoLogOut,
  IoLockClosed,
  IoCamera,
  IoPhonePortrait,
  IoDesktop,
} from "react-icons/io5";

import {
  useEffect,
  useState,
} from "react";

import { useTheme } from "../../context/ThemeContext.jsx";

import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

import useUpdateProfileMutation from "../../hooks/users/useUpdateProfileMutation.js";
import useUpdateAvatarMutation from "../../hooks/users/useUpdateAvatarMutation.js";
import useDeleteAvatarMutation from "../../hooks/users/useDeleteAvatarMutation.js";
import useChangePasswordMutation from "../../hooks/users/useChangePasswordMutation.js";
import useLogoutMutation from "../../hooks/auth/useLogoutMutation.js";
import useSessionsQuery from "../../hooks/auth/useSessionsQuery.js";
import useLogoutSessionMutation from "../../hooks/auth/useLogoutSessionMutation.js";

const ProfilePage = () => {

  const { data: currentUser } =
    useCurrentUserQuery();

  const {
    mutate: updateProfileMutation,
    isPending: isUpdatingProfile,
  } = useUpdateProfileMutation();

  const {
    mutate: updateAvatarMutation, 
    isPending: isUpdatingAvatar,
  } = useUpdateAvatarMutation();

  const {
    mutate: deleteAvatarMutation,
    isPending: isDeletingAvatar,
  } = useDeleteAvatarMutation();

  const {
  mutate: changePasswordMutation,
  isPending: isChangingPassword,
} = useChangePasswordMutation();

const {
  mutate: logoutMutation,
  isPending: isLoggingOut,
} = useLogoutMutation();

const {
  data: sessions = [],
} = useSessionsQuery();

const {
  mutate: logoutSessionMutation,
} =
  useLogoutSessionMutation();

const currentSession =
  sessions.find(
    (session) =>
      session.isCurrent
  );

const otherSessions =
  sessions.filter(
    (session) =>
      !session.isCurrent
  );

  const {
    themeMode,
    setThemeMode,
  } = useTheme();

  const [
  showPasswordModal,
  setShowPasswordModal,
] = useState(false);

const [
  showSessionsModal,
  setShowSessionsModal,
] = useState(false);

const [
  passwordData,
  setPasswordData,
] = useState({
  oldPassword: "",
  newPassword: "",
});
  const [previewAvatar, setPreviewAvatar] =
    useState(null);

  const [
    showAvatarModal,
    setShowAvatarModal,
  ] = useState(false);

  const firstLetter =
    currentUser?.fullName
      ?.charAt(0)
      ?.toUpperCase() ||

    currentUser?.username
      ?.charAt(0)
      ?.toUpperCase() ||

    "?";

  const [formData, setFormData] =
    useState({
      username: "",
      bio: "",
    });

  useEffect(() => {

    if (currentUser) {

      setFormData({
        username:
          currentUser.username || "",

        bio:
          currentUser.bio || "",
      });

    }

  }, [currentUser]);

  useEffect(() => {

    return () => {

      if (previewAvatar) {

        URL.revokeObjectURL(
          previewAvatar
        );

      }

    };

  }, [previewAvatar]);

  const handleSave = () => {

    updateProfileMutation(
      formData
    );

  };

  const handleAvatarChange = (e) => {

    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPreviewAvatar(
      previewUrl
    );

    const formData =
      new FormData();

    formData.append(
      "avatar",
      file
    );

    updateAvatarMutation(
      formData,
      {
        onSuccess: () => {

          setPreviewAvatar(
            null
          );

        },

        onError: () => {

          setPreviewAvatar(
            null
          );

        },
      }
    );

  };
  const handleChangePassword =
  () => {

    changePasswordMutation(
      passwordData,
      {
        onSuccess: () => {

          setPasswordData({
            oldPassword: "",
            newPassword: "",
          });

          setShowPasswordModal(
            false
          );

        },
      }
    );

  };

  const handleDeleteAvatar = () => {

    deleteAvatarMutation(
      undefined,
      {
        onSuccess: () => {

          setPreviewAvatar(
            null
          );

          setShowAvatarModal(
            false
          );

        },
      }
    );

  };

  const isFormChanged =

    formData.username !==
      (
        currentUser?.username ||
        ""
      ) ||

    formData.bio !==
      (
        currentUser?.bio ||
        ""
      );

  return (

    <div
      className="
        scrollbar-hide

        flex-1

        overflow-y-auto

        bg-background

        pb-16

        text-foreground

        transition-colors
        duration-300

        md:pb-0
      "
    >

      <div
        className="
          mx-auto

          flex
          w-full
          max-w-3xl
          flex-col
          gap-6

          p-4

          md:p-6
        "
      >

        {/* HEADER */}
        <div className="hidden md:block">

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
            "
          >
            Profile
          </h1>

          <p
            className="
              mt-1

              text-sm

              text-muted
            "
          >
            Manage your account
            settings
          </p>

        </div>

        {/* PROFILE CARD */}
        <div
          className="
            rounded-3xl

            border
            border-border

            bg-surface

            p-6

            shadow-sm

            transition-all
            duration-300
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              gap-5

              sm:flex-row
            "
          >

            {/* AVATAR */}
            <div
              className="
                flex
                flex-col
                items-center
              "
            >

              <button
                type="button"

                onClick={() => {

                  if (
                    isUpdatingAvatar ||
                    isDeletingAvatar
                  ) {
                    return;
                  }

                  if (
                    previewAvatar ||
                    currentUser?.avatar?.url
                  ) {

                    setShowAvatarModal(
                      true
                    );

                  }

                }}

                className="
                  relative

                  transition-transform
                  duration-200

                  hover:scale-[1.02]
                  active:scale-[0.98]
                "
              >

                {(
                  previewAvatar ||
                  currentUser?.avatar
                ) ? (

                  <img
                    src={
                      previewAvatar ||
                      currentUser
                        ?.avatar?.url
                    }

                    alt="profile"

                    className="
                      h-24
                      w-24

                      rounded-full

                      object-cover

                      ring-4
                      ring-surface-secondary

                      transition-all
                      duration-300
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center

                      rounded-full

                      bg-surface-secondary

                      text-3xl
                      font-semibold
                      text-white

                      ring-4
                      ring-surface-secondary
                    "
                  >

                    {firstLetter}

                  </div>

                )}

                {/* LOADING OVERLAY */}
                {(
                  isUpdatingAvatar ||
                  isDeletingAvatar
                ) && (

                  <div
                    className="
                      absolute
                      inset-0

                      flex
                      items-center
                      justify-center

                      rounded-full

                      bg-black/50

                      backdrop-blur-[2px]
                    "
                  >

                    <div
                      className="
                        h-6
                        w-6

                        animate-spin

                        rounded-full

                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                  </div>

                )}

                {/* CAMERA BUTTON */}
                <label
                  onClick={(e) =>
                    e.stopPropagation()
                  }

                  className={`
                    absolute
                    bottom-0
                    right-0

                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-full

                    bg-accent

                    text-white

                    shadow-lg

                    transition-all
                    duration-200

                    ${
                      isUpdatingAvatar ||
                      isDeletingAvatar

                        ? `
                            cursor-not-allowed
                            opacity-70
                          `

                        : `
                            cursor-pointer
                            hover:scale-105
                            active:scale-95
                          `
                    }
                  `}
                >

                  <IoCamera
                    size={16}
                  />

                  <input
                    id="avatar"
                    name="avatar"
                    type="file"

                    accept="image/*"

                    disabled={
                      isUpdatingAvatar ||
                      isDeletingAvatar
                    }

                    onChange={
                      handleAvatarChange
                    }

                    className="hidden"
                  />

                </label>

              </button>

            </div>

            {/* INFO */}
            <div
              className="
                flex-1

                text-center

                sm:text-left
              "
            >

              <h2
                className="
                  text-2xl
                  font-semibold
                "
              >
                {
                  currentUser?.fullName
                }
              </h2>

              <p
                className="
                  text-sm

                  text-muted
                "
              >
                @
                {
                  currentUser?.username
                }
              </p>

              {currentUser?.avatar && (

                <button
                  type="button"

                  onClick={
                    handleDeleteAvatar
                  }

                  disabled={
                    isDeletingAvatar ||
                    isUpdatingAvatar
                  }

                  className="
                    mt-2

                    text-sm
                    font-medium

                    text-accent

                    transition-all
                    duration-200

                    hover:opacity-80

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {isDeletingAvatar
                    ? "Removing..."
                    : "Remove profile photo"}

                </button>

              )}

              <p
                className="
                  mt-3

                  text-sm
                  leading-relaxed

                  text-foreground/80
                "
              >
                {currentUser?.bio || "No bio yet"}
              </p>

            </div>

          </div>

          {/* FORM */}
          <div
            className="
              mt-8

              grid
              gap-5
            "
          >

            {/* USERNAME */}
            <div>

              <label
                htmlFor="username"

                className="
                  mb-2
                  block

                  text-sm
                  font-medium

                  text-muted
                "
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"

                autoComplete="username"

                value={
                  formData?.username
                }

                onChange={(e) =>
                  setFormData({
                    ...formData,

                    username:
                      e.target.value,
                  })
                }

                placeholder="Username"

                className="
                  w-full

                  rounded-2xl

                  border
                  border-border

                  bg-background

                  px-4
                  py-3

                  text-foreground

                  outline-none

                  transition-all
                  duration-200

                  focus:border-accent
                  focus:ring-4
                  focus:ring-accent/10
                "
              />

            </div>

            {/* BIO */}
            <div>

              <label
                htmlFor="bio"

                className="
                  mb-2
                  block

                  text-sm
                  font-medium

                  text-muted
                "
              >
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"

                rows="4"

                maxLength={160}

                value={
                  formData.bio
                }

                onChange={(e) =>
                  setFormData({
                    ...formData,

                    bio:
                      e.target.value,
                  })
                }

                placeholder="Write something..."

                className="
                  w-full

                  resize-none

                  rounded-2xl

                  border
                  border-border

                  bg-background

                  px-4
                  py-3

                  text-foreground

                  outline-none

                  transition-all
                  duration-200

                  focus:border-accent
                  focus:ring-4
                  focus:ring-accent/10
                "
              />

            </div>

            {/* SAVE */}
            <button
              type="button"

              onClick={
                handleSave
              }

              disabled={
                isUpdatingProfile ||
                !isFormChanged
              }

              className="
                mt-2

                rounded-2xl

                bg-accent

                px-5
                py-3

                font-medium
                text-white

                shadow-sm

                transition-all
                duration-200

                hover:brightness-110

                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-70
                disabled:hover:brightness-100
              "
            >

              {isUpdatingProfile
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>

        {/* APPEARANCE */}
        <div
          className="
            rounded-3xl

            border
            border-border

            bg-surface

            p-6

            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h3
                className="
                  text-lg
                  font-semibold
                "
              >
                Appearance
              </h3>

              <p
                className="
                  mt-1

                  text-sm

                  text-muted
                "
              >
                Customize app
                appearance
              </p>

            </div>

            {/* THEME BUTTONS */}
            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {[
                "light",
                "dark",
                "system",
              ].map((mode) => (

                <button
                  key={mode}

                  type="button"

                  onClick={() =>
                    setThemeMode(
                      mode
                    )
                  }

                  className={`
                    rounded-2xl

                    px-4
                    py-2.5

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    ${
                      themeMode === mode

                        ? `
                            bg-accent
                            text-white

                            shadow-sm
                          `

                        : `
                            border
                            border-border

                            bg-background

                            text-foreground

                            hover:bg-hover
                          `
                    }
                  `}
                >

                  {mode
                    .charAt(0)
                    .toUpperCase() +

                    mode.slice(1)}

                </button>

              ))}

            </div>

          </div>

        </div>

        {/* SECURITY */}
        <div
          className="
            rounded-3xl

            border
            border-border

            bg-surface

            p-6

            shadow-sm
          "
        >

          <h3
            className="
              text-lg
              font-semibold
            "
          >
            Security
          </h3>

          <p
            className="
              mt-1

              text-sm

              text-muted
            "
          >
            Manage your account
            security
          </p>

          <div
  className="
    mt-6

    flex
    flex-col
    gap-3
  "
>
  {/* SESSIONS */}
  <button
  type="button"

  onClick={() =>
    setShowSessionsModal(
      true
    )
  }

  className="
    flex
    items-center
    justify-between

    rounded-2xl

    border
    border-border

    bg-background

    px-5
    py-4

    transition-all
    duration-200

    hover:bg-hover
  "
>

  <div
    className="
      text-left
    "
  >

    <p
      className="
        text-sm
        font-medium
      "
    >
      Manage Devices
    </p>

    <p
      className="
        mt-1

        text-xs

        text-muted
      "
    >
      {
        sessions.length
      } active sessions
    </p>

  </div>

  <IoDesktop
    size={20}
  />

</button>

  {/* ACTIONS */}
  <div
    className="
      flex
      flex-col
      gap-3

      sm:flex-row
    "
  >

    <button
      type="button"

      onClick={() =>
        setShowPasswordModal(
          true
        )
      }

      className="
        flex
        items-center
        justify-center
        gap-2

        rounded-2xl

        border
        border-border

        bg-background

        px-5
        py-3

        transition-all
        duration-200

        hover:bg-hover
      "
    >

      <IoLockClosed
        size={18}
      />

      Change Password

    </button>

    <button
      type="button"

      onClick={() =>
        logoutMutation()
      }

      disabled={
        isLoggingOut
      }

      className="
        flex
        items-center
        justify-center
        gap-2
        rounded-2xl
        px-5
        py-3
        transition-all
        duration-200
        hover:bg-hover
        border 
        border-border
        bg-background
        text-foreground
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
    >

      <IoLogOut
        size={18}
      />

      {isLoggingOut
        ? "Logging out..."
        : "Logout"}

    </button>

  </div>

  

</div>

        </div>

      </div>

      {/* AVATAR MODAL */}
      {showAvatarModal && (

        <div
          onClick={() =>
            setShowAvatarModal(
              false
            )
          }

          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/85

            p-4

            backdrop-blur-sm
          "
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            className="
              relative

              overflow-hidden

              rounded-3xl

              shadow-2xl
            "
          >

            <img
              src={
                previewAvatar ||
                currentUser?.avatar?.url
              }

              alt="profile"

              className="
                max-h-[90vh]
                max-w-[90vw]

                object-contain
              "
            />

            <button
              type="button"

              onClick={() =>
                setShowAvatarModal(
                  false
                )
              }

              className="
                absolute
                right-3
                top-3

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                bg-black/50

                text-xl
                text-white

                backdrop-blur-md

                transition-all
                duration-200

                hover:bg-black/70
              "
            >

              ✕

            </button>

          </div>

        </div>

      )}

      {showPasswordModal && (

  <div
    className="
      fixed
      inset-0
      z-50

      flex
      items-center
      justify-center

      bg-black/70

      p-4
    "
  >

    <div
      className="
        w-full
        max-w-md

        rounded-3xl

        bg-surface

        p-6
      "
    >

      <h2
        className="
          text-xl
          font-semibold
        "
      >
        Change Password
      </h2>

      <div
        className="
          mt-5

          grid
          gap-4
        "
      >

        <input
          id="current-password"
          name="current-password"
          type="password"

          placeholder="Current password"

          value={
            passwordData.oldPassword
          }

          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              oldPassword:
                e.target.value,
            })
          }

          className="
            w-full

            rounded-2xl

            border
            border-border

            bg-background

            px-4
            py-3

            outline-none
          "
        />

        <input
          id="new-password"
          name="new-password"
          type="password"

          placeholder="New password"

          value={
            passwordData.newPassword
          }

          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              newPassword:
                e.target.value,
            })
          }

          className="
            w-full

            rounded-2xl

            border
            border-border

            bg-background

            px-4
            py-3

            outline-none
          "
        />

      </div>

      <div
        className="
          mt-6

          flex
          justify-end
          gap-3
        "
      >

        <button
          onClick={() =>
            setShowPasswordModal(
              false
            )
          }

          className="
            rounded-2xl

            border
            border-border

            px-4
            py-2
          "
        >
          Cancel
        </button>

        <button
          onClick={
            handleChangePassword
          }

          disabled={
            isChangingPassword
          }

          className="
            rounded-2xl

            bg-accent

            px-4
            py-2

            text-white
          "
        >

          {isChangingPassword
            ? "Changing..."
            : "Save"}

        </button>

      </div>

    </div>

  </div>

)}

{
  showSessionsModal && (

    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        bg-black/70

        p-4
      "
    >

      <div
  className="
    w-full
    max-w-2xl

    rounded-3xl

    bg-surface
    p-6
  "
>

  <div
    className="
      flex
      items-center
      justify-between
    "
  >

    <div>

      <h2
        className="
          text-xl
          font-semibold
        "
      >
        Active Sessions
      </h2>

      <p
        className="
          mt-1

          text-sm

          text-muted
        "
      >
        Devices currently
        logged into your
        account
      </p>

    </div>

    <button
      onClick={() =>
        setShowSessionsModal(
          false
        )
      }

      className="
        text-xl
      "
    >
      ✕
    </button>

  </div>

  {/* SCROLLABLE CONTAINER */}
  <div
    className="
      mt-6

      max-h-[70vh]
      overflow-y-auto

      pr-2

      space-y-6
      scrollbar-hide
    "
  >

    {currentSession && (

      <div>

        <h3
          className="
            mb-3

            text-sm
            font-semibold

            text-muted
          "
        >
          Current Device
        </h3>

        <div
          className="
            flex
            items-center
            justify-between

            rounded-2xl

            border
            border-accent/20

            bg-accent/5

            p-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-2xl

                bg-accent/10

                text-accent
              "
            >

              {currentSession.device
                ?.toLowerCase()
                ?.includes(
                  "iphone"
                ) ||

              currentSession.device
                ?.toLowerCase()
                ?.includes(
                  "android"
                )

                ? (
                  <IoPhonePortrait
                    size={20}
                  />
                )

                : (
                  <IoDesktop
                    size={20}
                  />
                )}

            </div>

            <div>

              <h5
                className="
                  text-sm
                  font-medium
                "
              >
                {
                  currentSession.device
                }
              </h5>

              <p
                className="
                  mt-1

                  text-xs

                  text-muted
                "
              >
                {
                  currentSession.location
                }
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-muted
                "
              >
                {new Date(
                  currentSession.lastUsedAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

          <div
            className="
              rounded-full

              bg-green-500/10

              px-3
              py-1

              text-xs
              font-medium

              text-green-500
            "
          >
            Current
          </div>

        </div>

      </div>

    )}

    {otherSessions.length > 0 && (

      <div>

        <h3
          className="
            mb-3

            text-sm
            font-semibold

            text-muted
          "
        >
          Other Devices
        </h3>

        <div
          className="
            grid
            gap-3
          "
        >

          {otherSessions.map(
            (session) => (

              <div
                key={session._id}

                className="
                  flex
                  items-center
                  justify-between

                  rounded-2xl

                  border
                  border-border

                  bg-background

                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      rounded-2xl

                      bg-accent/10

                      text-accent
                    "
                  >

                    {session.device
                      ?.toLowerCase()
                      ?.includes(
                        "iphone"
                      ) ||

                    session.device
                      ?.toLowerCase()
                      ?.includes(
                        "android"
                      )

                      ? (
                        <IoPhonePortrait
                          size={20}
                        />
                      )

                      : (
                        <IoDesktop
                          size={20}
                        />
                      )}

                  </div>

                  <div>

                    <h5
                      className="
                        text-sm
                        font-medium
                      "
                    >
                      {
                        session.device
                      }
                    </h5>

                    <p
                      className="
                        mt-1

                        text-xs

                        text-muted
                      "
                    >
                      {
                        session.location
                      }
                    </p>

                    <p
                      className="
                        mt-1

                        text-xs

                        text-muted
                      "
                    >
                      {new Date(
                        session.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    logoutSessionMutation(
                      session._id
                    )
                  }

                  className="
                    text-sm

                    font-medium

                    text-red-500

                    transition-opacity
                    duration-200

                    hover:opacity-80
                  "
                >
                  Log out
                </button>

              </div>

            )
          )}

        </div>

      </div>

    )}

  </div>

</div>

    </div>

  )
}

    </div>

  );
};

export default ProfilePage;