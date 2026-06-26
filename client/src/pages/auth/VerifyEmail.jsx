import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useVerifyEmailMutation } from "../../hooks/auth/useVerifyEmailMutation.js";
import { useResendVerificationMutation } from "../../hooks/auth/useResendVerificationMutation.js";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get("email") || localStorage.getItem("unverified_email") || "";

  const [otp, setOtp] = useState("");
  const [touched, setTouched] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const verifyEmailMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  // Cooldown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // If no email, redirect back to login
  useEffect(() => {
    if (!emailParam) {
      navigate("/auth");
    }
  }, [emailParam, navigate]);

  const handleVerify = (e) => {
    e.preventDefault();
    setTouched(true);

    if (otp.trim().length !== 6 || !/^\d+$/.test(otp.trim())) {
      return;
    }

    verifyEmailMutation.mutate(
      { email: emailParam, otp: otp.trim() },
      {
        onSuccess: () => {
          localStorage.removeItem("unverified_email");
          navigate("/");
        },
      }
    );
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;

    resendMutation.mutate(
      { email: emailParam },
      {
        onSuccess: () => {
          setResendCooldown(60); // 60 seconds cooldown
        },
      }
    );
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("unverified_email");
    navigate("/auth");
  };

  const isOtpValid = otp.trim().length === 6 && /^\d+$/.test(otp.trim());

  return (
    <div className="p-6 space-y-6 transition-colors duration-300 border shadow-xl rounded-3xl border-border bg-surface/90 backdrop-blur-xl sm:p-6 2xl:p-8">
      {/* HEADER */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20 mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted">
          We sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-foreground text-sm mt-0.5 break-all">
          {emailParam}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* OTP INPUT */}
        <div className="relative">
          <input
            type="text"
            id="otp"
            name="otp"
            maxLength={6}
            disabled={verifyEmailMutation.isPending}
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
              setTouched(true);
            }}
            placeholder=" "
            className={`w-full px-4 pt-6 pb-3 text-center text-lg tracking-[0.5em] font-mono transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
              touched && !isOtpValid
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-accent"
            }`}
          />
          <label
            htmlFor="otp"
            className="absolute text-sm transition-all duration-200 -translate-x-1/2 -translate-y-1/2 pointer-events-none left-1/2 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
          >
            Verification Code
          </label>
        </div>

        {touched && !isOtpValid && (
          <p className="text-xs text-red-500 text-center">
            Verification code must be exactly 6 digits
          </p>
        )}

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={verifyEmailMutation.isPending || !isOtpValid}
          className="w-full flex justify-center items-center rounded-2xl cursor-pointer bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {verifyEmailMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </button>
      </form>

      {/* ACTION FOOTER */}
      <div className="flex flex-col items-center gap-3 pt-2 text-sm border-t border-border/50">
        <div className="text-center">
          <span className="text-muted">Didn&apos;t receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendMutation.isPending}
            className="font-medium text-accent hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendMutation.isPending
              ? "Resending..."
              : "Resend Code"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="flex items-center gap-1.5 font-medium text-muted hover:text-foreground transition-colors animate-pulse-subtle"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login / Use another email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
