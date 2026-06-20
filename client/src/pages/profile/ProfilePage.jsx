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
import { checkUsername } from "../../services/authService.js";
import { Check, X } from "lucide-react";
import { compressImage } from "../../utils/imageCompressor.js";


const PasswordChecklist = ({ password, touched }) => {
  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "One number (0-9)", valid: /\d/.test(password) },
    { label: "One special character (e.g. @, $, !, %)", valid: /[\W_]/.test(password) },
  ];

  if (!touched) return null;

  return (
    <div className="p-3 mt-2 space-y-1.5 text-xs border rounded-2xl bg-surface-secondary/40 border-border/50">
      <p className="font-medium text-muted">Password requirements:</p>
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {rule.valid ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <X className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={rule.valid ? "text-emerald-500/90" : "text-muted"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};


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
    confirmNewPassword: "",
  });

  const [passwordTouched, setPasswordTouched] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [usernameAvailability, setUsernameAvailability] = useState({
    status: "idle", // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
    message: "",
  });

  const [usernameTouched, setUsernameTouched] = useState(false);

  const [formData, setFormData] =
    useState({
      username: "",
      bio: "",
    });

  const [previewAvatar, setPreviewAvatar] =
    useState(null);

  useEffect(() => {
    const username = formData.username.trim();
    if (!username) {
      setUsernameAvailability({ status: "idle", message: "" });
      return;
    }

    if (username === currentUser?.username) {
      setUsernameAvailability({ status: "available", message: "" });
      return;
    }

    if (username.length < 3) {
      setUsernameAvailability({ status: "invalid", message: "Username must be at least 3 characters" });
      return;
    }

    if (username.length > 30) {
      setUsernameAvailability({ status: "invalid", message: "Username must be at most 30 characters" });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameAvailability({ status: "invalid", message: "Username must contain only letters, numbers, and underscores" });
      return;
    }

    setUsernameAvailability({ status: "checking", message: "Checking availability..." });

    const timer = setTimeout(async () => {
      try {
        const response = await checkUsername(username);
        if (response.available) {
          setUsernameAvailability({ status: "available", message: "Username is available" });
        } else {
          setUsernameAvailability({ status: "taken", message: "Username is already taken" });
        }
      } catch {
        setUsernameAvailability({ status: "idle", message: "" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.username, currentUser?.username]);

  const isProfileFormValid =
    (formData.username === currentUser?.username || usernameAvailability.status === "available") &&
    formData.username.trim().length >= 3 &&
    formData.username.trim().length <= 30 &&
    formData.bio.length <= 100;

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

  const handleAvatarChange = async (e) => {

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

    // Compress avatar image to max 800x800 and 0.8 quality
    const compressedFile = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    });

    const previewUrl =
      URL.createObjectURL(compressedFile);

    setPreviewAvatar(
      previewUrl
    );

    const formData =
      new FormData();

    formData.append(
      "avatar",
      compressedFile
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
  const closePasswordModal = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setPasswordTouched({
      oldPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
    setShowPasswordModal(false);
  };

  const isNewPasswordValid =
    passwordData.newPassword.length >= 8 &&
    /[A-Z]/.test(passwordData.newPassword) &&
    /[a-z]/.test(passwordData.newPassword) &&
    /\d/.test(passwordData.newPassword) &&
    /[\W_]/.test(passwordData.newPassword);

  const isPasswordFormValid =
    passwordData.oldPassword.trim() &&
    isNewPasswordValid &&
    passwordData.newPassword === passwordData.confirmNewPassword &&
    passwordData.newPassword !== passwordData.oldPassword;

  const handleChangePassword =
    () => {

      if (!isPasswordFormValid) return;

      const payload = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      };

      changePasswordMutation(
        payload,
        {
          onSuccess: () => {
            closePasswordModal();
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
      className="flex-1 pb-16 overflow-y-auto transition-colors duration-300 scrollbar-hide bg-background text-foreground md:pb-0"
    >

      <div
        className="flex flex-col w-full max-w-3xl gap-6 p-4 mx-auto md:p-6"
      >

        {/* HEADER */}
        <div className="hidden md:block">

          <h1
            className="text-3xl font-bold tracking-tight "
          >
            Profile
          </h1>

          <p
            className="mt-1 text-sm text-muted"
          >
            Manage your account
            settings
          </p>

        </div>

        {/* PROFILE CARD */}
        <div
          className="p-6 transition-all duration-300 border shadow-sm rounded-3xl border-border bg-surface"
        >

          <div
            className="flex flex-col items-center gap-5 sm:flex-row"
          >

            {/* AVATAR */}
            <div
              className="flex flex-col items-center "
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
                  cursor-pointer

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

                    className="object-cover w-24 h-24 transition-all duration-300 rounded-full ring-4 ring-surface-secondary"
                  />

                ) : (

                  <div
                    className="flex items-center justify-center w-24 h-24 text-3xl font-semibold text-white rounded-full bg-surface-secondary ring-4 ring-surface-secondary"
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
                        className="w-6 h-6 border-2 rounded-full animate-spin border-white/30 border-t-white"
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

                    ${isUpdatingAvatar ||
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
              className="flex-1 text-center sm:text-left"
            >

              <h2
                className="text-2xl font-semibold "
              >
                {
                  currentUser?.fullName
                }
              </h2>

              <p
                className="text-sm text-muted"
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

                  className="mt-2 text-sm font-medium transition-all duration-200 cursor-pointer text-accent hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isDeletingAvatar
                    ? "Removing..."
                    : "Remove profile photo"}

                </button>

              )}

              <p
                className="mt-3 text-sm leading-relaxed text-foreground/80"
              >
                {currentUser?.bio || "No bio yet"}
              </p>

            </div>

          </div>

          {/* FORM */}
          <div
            className="grid gap-5 mt-8 "
          >

            {/* USERNAME */}
            <div>

              <label
                htmlFor="username"

                className="block mb-2 text-sm font-medium text-muted"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"

                autoComplete="off"

                value={
                  formData?.username
                }

                onChange={(e) => {
                  setUsernameTouched(true);
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  });
                }}

                onBlur={() => setUsernameTouched(true)}

                placeholder="Username"

                className={`w-full px-4 py-3 transition-all duration-200 border outline-none rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 ${
                  usernameTouched && formData.username !== currentUser?.username
                    ? usernameAvailability.status === "available"
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-red-500 focus:border-red-500"
                    : "border-border focus:border-accent"
                }`}
              />

              {usernameTouched && formData.username !== currentUser?.username && (
                usernameAvailability.status === "checking" ? (
                  <p className="mt-1 ml-1 text-xs text-muted animate-pulse">
                    Checking username availability...
                  </p>
                ) : usernameAvailability.status === "available" ? (
                  <p className="mt-1 ml-1 text-xs text-emerald-500">
                    Username is available
                  </p>
                ) : usernameAvailability.status === "taken" ? (
                  <p className="mt-1 ml-1 text-xs text-red-500">
                    Username is already taken
                  </p>
                ) : usernameAvailability.status === "invalid" ? (
                  <p className="mt-1 ml-1 text-xs text-red-500">
                    {usernameAvailability.message}
                  </p>
                ) : null
              )}

            </div>

            {/* BIO */}
            <div>

              <label
                htmlFor="bio"

                className="block mb-2 text-sm font-medium text-muted"
              >
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"

                rows="4"

                maxLength={100}

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

                className="w-full px-4 py-3 transition-all duration-200 border outline-none resize-none rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
              />

              <div className="flex justify-end mt-1 text-xs text-muted">
                {formData.bio.length} / 100 characters
              </div>

            </div>

            {/* SAVE */}
            <button
              type="button"

              onClick={
                handleSave
              }

              disabled={
                isUpdatingProfile ||
                !isFormChanged ||
                !isProfileFormValid
              }

              className="
                mt-2

                rounded-2xl

                bg-accent

                px-5
                py-3
                cursor-pointer

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
          className="p-6 border shadow-sm rounded-3xl border-border bg-surface"
        >

          <div
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >

            <div>

              <h3
                className="text-lg font-semibold "
              >
                Appearance
              </h3>

              <p
                className="mt-1 text-sm text-muted"
              >
                Customize app
                appearance
              </p>

            </div>

            {/* THEME BUTTONS */}
            <div
              className="flex flex-wrap gap-2 "
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
                    cursor-pointer
                    py-2.5

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    ${themeMode === mode

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
          className="p-6 border shadow-sm rounded-3xl border-border bg-surface"
        >

          <h3
            className="text-lg font-semibold "
          >
            Security
          </h3>

          <p
            className="mt-1 text-sm text-muted"
          >
            Manage your account
            security
          </p>

          <div
            className="flex flex-col gap-3 mt-6 "
          >
            {/* SESSIONS */}
            <button
              type="button"

              onClick={() =>
                setShowSessionsModal(
                  true
                )
              }

              className="flex items-center justify-between px-5 py-4 transition-all duration-200 border cursor-pointer rounded-2xl border-border bg-background hover:bg-hover"
            >

              <div
                className="text-left "
              >

                <p
                  className="text-sm font-medium "
                >
                  Manage Devices
                </p>

                <p
                  className="mt-1 text-xs text-muted"
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
              className="flex flex-col gap-3 sm:flex-row"
            >

              <button
                type="button"

                onClick={() =>
                  setShowPasswordModal(
                    true
                  )
                }

                className="flex items-center justify-center gap-2 px-5 py-3 transition-all duration-200 border cursor-pointer rounded-2xl border-border bg-background hover:bg-hover"
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

                className="flex items-center justify-center gap-2 px-5 py-3 transition-all duration-200 border cursor-pointer rounded-2xl hover:bg-hover border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-70"
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

          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }

            className="relative overflow-hidden shadow-2xl rounded-3xl"
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

              className="absolute flex items-center justify-center w-10 h-10 text-xl text-white transition-all duration-200 rounded-full cursor-pointer right-3 top-3 bg-black/50 backdrop-blur-md hover:bg-black/70"
            >

              ✕

            </button>

          </div>

        </div>

      )}

      {showPasswordModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        >

          <div
            className="w-full max-w-md p-6 rounded-3xl bg-surface"
          >

            <h2
              className="text-xl font-semibold "
            >
              Change Password
            </h2>

            <div
              className="grid gap-4 mt-5 "
            >

              <input
                id="current-password"
                name="current-password"
                type="password"

                placeholder="Current password"

                value={
                  passwordData.oldPassword
                }

                onChange={(e) => {
                  setPasswordTouched((prev) => ({ ...prev, oldPassword: true }));
                  setPasswordData({
                    ...passwordData,
                    oldPassword:
                      e.target.value,
                  });
                }}

                onBlur={() =>
                  setPasswordTouched((prev) => ({ ...prev, oldPassword: true }))
                }

                className={`w-full px-4 py-3 border outline-none rounded-2xl bg-background ${
                  passwordTouched.oldPassword && !passwordData.oldPassword.trim()
                    ? "border-red-500 focus:border-red-500"
                    : "border-border focus:border-accent"
                }`}
              />
              {passwordTouched.oldPassword && !passwordData.oldPassword.trim() && (
                <p className="text-xs text-red-500 mt-1 ml-1">Current password is required</p>
              )}

              <input
                id="new-password"
                name="new-password"
                type="password"

                placeholder="New password"

                value={
                  passwordData.newPassword
                }

                onChange={(e) => {
                  setPasswordTouched((prev) => ({ ...prev, newPassword: true }));
                  setPasswordData({
                    ...passwordData,
                    newPassword:
                      e.target.value,
                  });
                }}

                onBlur={() =>
                  setPasswordTouched((prev) => ({ ...prev, newPassword: true }))
                }

                className={`w-full px-4 py-3 border outline-none rounded-2xl bg-background ${
                  passwordTouched.newPassword && (!isNewPasswordValid || passwordData.newPassword === passwordData.oldPassword)
                    ? "border-red-500 focus:border-red-500"
                    : passwordTouched.newPassword && isNewPasswordValid && passwordData.newPassword !== passwordData.oldPassword
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-border focus:border-accent"
                }`}
              />
              {passwordTouched.newPassword && passwordData.newPassword === passwordData.oldPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1">New password must be different from current password</p>
              )}

              {/* PASSWORD CHECKLIST */}
              <PasswordChecklist password={passwordData.newPassword} touched={passwordTouched.newPassword} />

              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type="password"

                placeholder="Confirm new password"

                value={
                  passwordData.confirmNewPassword
                }

                onChange={(e) => {
                  setPasswordTouched((prev) => ({ ...prev, confirmNewPassword: true }));
                  setPasswordData({
                    ...passwordData,
                    confirmNewPassword:
                      e.target.value,
                  });
                }}

                onBlur={() =>
                  setPasswordTouched((prev) => ({ ...prev, confirmNewPassword: true }))
                }

                className={`w-full px-4 py-3 border outline-none rounded-2xl bg-background ${
                  passwordTouched.confirmNewPassword && passwordData.newPassword !== passwordData.confirmNewPassword
                    ? "border-red-500 focus:border-red-500"
                    : passwordTouched.confirmNewPassword && passwordData.newPassword === passwordData.confirmNewPassword && isNewPasswordValid
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-border focus:border-accent"
                }`}
              />
              {passwordTouched.confirmNewPassword && (
                passwordData.newPassword !== passwordData.confirmNewPassword ? (
                  <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
                ) : isNewPasswordValid && passwordData.newPassword !== passwordData.oldPassword ? (
                  <p className="text-xs text-emerald-500 mt-1 ml-1">Passwords match</p>
                ) : null
              )}

            </div>

            <div
              className="flex justify-end gap-3 mt-6 "
            >

              <button
                onClick={
                  closePasswordModal
                }

                className="px-4 py-2 border cursor-pointer rounded-2xl border-border"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleChangePassword
                }

                disabled={
                  isChangingPassword || !isPasswordFormValid
                }

                className="px-4 py-2 text-white cursor-pointer rounded-2xl bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >

            <div
              className="w-full max-w-2xl p-6 rounded-3xl bg-surface"
            >

              <div
                className="flex items-center justify-between "
              >

                <div>

                  <h2
                    className="text-xl font-semibold "
                  >
                    Active Sessions
                  </h2>

                  <p
                    className="mt-1 text-sm text-muted"
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

                  className="text-xl cursor-pointer "
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
                      className="mb-3 text-sm font-semibold text-muted"
                    >
                      Current Device
                    </h3>

                    <div
                      className="flex items-center justify-between p-4 border rounded-2xl border-accent/20 bg-accent/5"
                    >

                      <div
                        className="flex items-center gap-3 "
                      >

                        <div
                          className="flex items-center justify-center h-11 w-11 rounded-2xl bg-accent/10 text-accent"
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
                            className="text-sm font-medium "
                          >
                            {
                              currentSession.device
                            }
                          </h5>

                          <p
                            className="mt-1 text-xs text-muted"
                          >
                            {
                              currentSession.location
                            }
                          </p>

                          <p
                            className="mt-1 text-xs text-muted"
                          >
                            {new Date(
                              currentSession.lastUsedAt
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <div
                        className="px-3 py-1 text-xs font-medium text-green-500 rounded-full bg-green-500/10"
                      >
                        Current
                      </div>

                    </div>

                  </div>

                )}

                {otherSessions.length > 0 && (

                  <div>

                    <h3
                      className="mb-3 text-sm font-semibold text-muted"
                    >
                      Other Devices
                    </h3>

                    <div
                      className="grid gap-3 "
                    >

                      {otherSessions.map(
                        (session) => (

                          <div
                            key={session._id}

                            className="flex items-center justify-between p-4 border rounded-2xl border-border bg-background"
                          >

                            <div
                              className="flex items-center gap-3 "
                            >

                              <div
                                className="flex items-center justify-center h-11 w-11 rounded-2xl bg-accent/10 text-accent"
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
                                  className="text-sm font-medium "
                                >
                                  {
                                    session.device
                                  }
                                </h5>

                                <p
                                  className="mt-1 text-xs text-muted"
                                >
                                  {
                                    session.location
                                  }
                                </p>

                                <p
                                  className="mt-1 text-xs text-muted"
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

                              className="text-sm font-medium text-red-500 transition-opacity duration-200 cursor-pointer hover:opacity-80"
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