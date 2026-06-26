import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "../../hooks/auth/useLoginMutation.js";

const Login = () => {
  const navigate = useNavigate();

  const loginMutation = useLoginMutation();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    login: false,
    password: false,
  });

  const isFormValid = formData.login.trim() && formData.password.length >= 8;

  // INPUT CHANGE

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });

    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  // SUBMIT

  const handleSubmit = (e) => {
    e.preventDefault();

    const { login, password } = formData;

    if (!login.trim() || !password.trim()) {
      setError("All fields are required");

      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");

      return;
    }

    setError("");

    loginMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/");
      },

      onError: (error) => {
        setError(error.response?.data?.message || "Login failed");
      },
    });
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

      {/* HEADER */}
      <div className="text-center ">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-muted">Login to continue chatting</p>
      </div>

      {/* LOGIN */}
      <div className="relative ">
        <input
          type="text"
          id="login"
          name="login"
          autoComplete="username"
          disabled={loginMutation.isPending}
          value={formData.login}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
            touched.login && !formData.login.trim()
              ? "border-red-500 focus:border-red-500"
              : "border-border focus:border-accent"
          }`}
        />

        <label
          htmlFor="login"
          className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
        >
          Username or email
        </label>

        {touched.login && !formData.login.trim() && (
          <p className="mt-1 ml-1 text-xs text-red-500">
            Username or email is required
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          autoComplete="current-password"
          disabled={loginMutation.isPending}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          className={`w-full px-4 pt-6 pb-3 pr-12 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 ${
            touched.password &&
            (formData.password.length < 8 || !formData.password.trim())
              ? "border-red-500 focus:border-red-500"
              : "border-border focus:border-accent"
          }`}
        />

        <label
          htmlFor="password"
          className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
        >
          Password
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute -translate-y-1/2 right-4 top-1/2 text-muted hover:text-foreground transition-colors duration-200"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {touched.password &&
          (!formData.password.trim() ? (
            <p className="mt-1 ml-1 text-xs text-red-500">
              Password is required
            </p>
          ) : formData.password.length < 8 ? (
            <p className="mt-1 ml-1 text-xs text-red-500">
              Password must be at least 8 characters
            </p>
          ) : null)}
      </div>

      {/* FORGOT */}
      <div className="text-right ">
        <Link
          to="/auth/forgot-password"
          className="text-sm transition-opacity duration-200 text-accent hover:opacity-80"
        >
          Forgot password?
        </Link>
      </div>

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loginMutation.isPending || !isFormValid}
        className="
          w-full

          rounded-2xl
          cursor-pointer

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

          active:scale-[0.99]

          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>

      {/* FOOTER */}
      <div className="text-center ">
        <p className="text-sm text-muted">
          Don&apos;t have an account?
          <Link
            to="/auth/signup"
            className="ml-1 font-medium transition-opacity duration-200 text-accent hover:opacity-80"
          >
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
};

export default Login;
