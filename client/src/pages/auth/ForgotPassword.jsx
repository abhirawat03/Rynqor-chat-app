import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      // Mimic API request delay. If backend endpoints exist, connect them here.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      toast.success("Reset link sent successfully");
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
      if (import.meta.env.MODE !== "production") {
        console.error("Forgot password request failed:", err);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-4 transition-colors duration-300 border shadow-xl rounded-3xl border-border bg-surface/90 backdrop-blur-xl sm:p-6 2xl:p-8"
    >
      {/* ERROR */}
      {error && (
        <div className="px-4 py-3 text-sm text-red-500 border rounded-2xl border-red-500/20 bg-red-500/10">
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success ? (
        <div className="space-y-4 text-center py-4">
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
            <h2 className="text-xl font-bold text-foreground">Check your email</h2>
            <p className="text-sm text-muted">
              We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
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
      ) : (
        <>
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email to receive a reset link
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
              placeholder=" "
              className="w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60"
            />
            <label
              htmlFor="email"
              className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
            >
              Email Address
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="w-full rounded-2xl cursor-pointer bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Sending Link..." : "Send Reset Link"}
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
      )}
    </form>
  );
};

export default ForgotPassword;
