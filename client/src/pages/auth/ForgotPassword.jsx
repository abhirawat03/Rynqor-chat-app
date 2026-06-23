import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "../../services/authService.js";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, email: true }));

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Invalid email format");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      await forgotPassword(email.trim());
      setStep(2);
      toast.success("OTP sent to your email");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send OTP. Please try again."
      );
      if (import.meta.env.MODE !== "production") {
        console.error("Forgot password request failed:", err);
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      otp: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    if (otp.trim().length !== 6 || !/^\d+$/.test(otp.trim())) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/;
    if (!complexityRegex.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccess(true);
      toast.success("Password reset successfully");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
      if (import.meta.env.MODE !== "production") {
        console.error("Reset password failed:", err);
      }
    } finally {
      setIsPending(false);
    }
  };

  const emailInvalid = touched.email && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const otpInvalid = touched.otp && (otp.trim().length !== 6 || !/^\d+$/.test(otp.trim()));
  const newPasswordInvalid = touched.newPassword && (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(newPassword));
  const confirmPasswordInvalid = touched.confirmPassword && (confirmPassword !== newPassword);

  if (success) {
    return (
      <div className="p-6 space-y-4 transition-colors duration-300 border shadow-xl rounded-3xl border-border bg-surface/90 backdrop-blur-xl sm:p-6 2xl:p-8 text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Password Reset Complete</h2>
          <p className="text-sm text-muted">
            Your password has been successfully updated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/auth"
            className="inline-flex justify-center w-full rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:brightness-110 active:scale-[0.99] transition-all duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit}
      className="p-6 space-y-4 transition-colors duration-300 border shadow-xl rounded-3xl border-border bg-surface/90 backdrop-blur-xl sm:p-6 2xl:p-8"
    >
      {/* ERROR */}
      {error && (
        <div className="px-4 py-3 text-sm text-red-500 border rounded-2xl border-red-500/20 bg-red-500/10">
          {error}
        </div>
      )}

      {step === 1 ? (
        <>
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email to receive a 6-digit OTP
            </p>
          </div>

          {/* EMAIL INPUT */}
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              disabled={isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder=" "
              className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
                emailInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-accent"
              }`}
            />
            <label
              htmlFor="email"
              className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
            >
              Email Address
            </label>
            {emailInvalid && (
              <p className="mt-1 ml-1 text-xs text-red-500">
                {!email.trim() ? "Email address is required" : "Invalid email format"}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="w-full rounded-2xl cursor-pointer bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Sending OTP..." : "Send OTP"}
          </button>

          {/* FOOTER */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted">
              Remember your password?
              <Link
                to="/auth"
                className="ml-1 font-medium transition-opacity duration-200 text-accent hover:opacity-80"
              >
                Login
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Verify OTP
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter the 6-digit OTP sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          {/* OTP INPUT */}
          <div className="relative">
            <input
              type="text"
              id="otp"
              name="otp"
              maxLength={6}
              disabled={isPending}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onBlur={() => handleBlur("otp")}
              placeholder=" "
              className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
                otpInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-accent"
              }`}
            />
            <label
              htmlFor="otp"
              className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
            >
              6-Digit OTP
            </label>
            {otpInvalid && (
              <p className="mt-1 ml-1 text-xs text-red-500">
                OTP must be exactly 6 digits
              </p>
            )}
          </div>

          {/* NEW PASSWORD INPUT */}
          <div className="relative">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              disabled={isPending}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => handleBlur("newPassword")}
              placeholder=" "
              className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
                newPasswordInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-accent"
              }`}
            />
            <label
              htmlFor="newPassword"
              className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
            >
              New Password
            </label>
            {newPasswordInvalid && (
              <p className="mt-1 ml-1 text-xs text-red-500">
                Password must be at least 8 characters and contain uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD INPUT */}
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder=" "
              className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
                confirmPasswordInvalid
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-accent"
              }`}
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
            >
              Confirm Password
            </label>
            {confirmPasswordInvalid && (
              <p className="mt-1 ml-1 text-xs text-red-500">
                Passwords do not match
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPending || !otp.trim() || !newPassword || newPassword !== confirmPassword}
            className="w-full rounded-2xl cursor-pointer bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Resetting Password..." : "Reset Password"}
          </button>

          {/* BACK TO STEP 1 */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setTouched({
                  email: false,
                  otp: false,
                  newPassword: false,
                  confirmPassword: false,
                });
              }}
              className="text-sm font-medium transition-opacity duration-200 text-accent hover:opacity-80"
            >
              Change Email / Resend OTP
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ForgotPassword;
