import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { useLoginMutation }
  from "../../hooks/auth/useLoginMutation.js";

const Login = () => {

  const navigate =
    useNavigate();

  const loginMutation =
    useLoginMutation();

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      login: "",
      password: "",
    });

  // INPUT CHANGE

  const handleChange = (
    e
  ) => {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });

  };

  // SUBMIT

  const handleSubmit = (
    e
  ) => {

    e.preventDefault();

    const {
      login,
      password,
    } = formData;

    if (
      !login.trim() ||
      !password.trim()
    ) {

      setError(
        "All fields are required"
      );

      return;

    }

    if (
      password.length < 8
    ) {

      setError(
        "Password must be at least 8 characters"
      );

      return;

    }

    setError("");

    loginMutation.mutate(
      formData,
      {

        onSuccess: () => {

          navigate("/");

        },

        onError: (
          error
        ) => {

          setError(
            error.response?.data
              ?.message ||
              "Login failed"
          );

        },

      }
    );

  };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        space-y-4

        rounded-3xl

        border
        border-border

        bg-surface/90

        p-6

        shadow-xl

        backdrop-blur-xl

        transition-colors
        duration-300

        sm:p-6
2xl:p-8
      "
    >

      {/* ERROR */}
      {error && (

        <div
          className="
            rounded-2xl

            border
            border-red-500/20

            bg-red-500/10

            px-4
            py-3

            text-sm

            text-red-500
          "
        >
          {error}
        </div>

      )}

      {/* HEADER */}
      <div
        className="
          text-center
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            tracking-tight

            text-foreground
          "
        >
          Welcome back
        </h1>

        <p
          className="
            mt-2

            text-sm

            text-muted
          "
        >
          Login to continue chatting
        </p>

      </div>

      {/* LOGIN */}
      <div
        className="
          relative
        "
      >

        <input
          type="text"

          id="login"
          name="login"

          autoComplete="username"

          disabled={
            loginMutation.isPending
          }

          value={
            formData.login
          }

          onChange={
            handleChange
          }

          placeholder=" "

          className="
            peer

            w-full

            rounded-2xl

            border
            border-border

            bg-background

            px-4
            pb-3
            pt-6

            text-sm

            text-foreground

            outline-none

            transition-all
            duration-200

            focus:border-accent
            focus:ring-4
            focus:ring-accent/10

            disabled:opacity-60
          "
        />

        <label
          htmlFor="login"
          className="
            pointer-events-none

            absolute
            left-4
            top-1/2

            -translate-y-1/2

            text-sm

            text-muted

            transition-all
            duration-200

            peer-focus:top-4
            peer-focus:text-xs
            peer-focus:text-accent

            peer-not-placeholder-shown:top-4
            peer-not-placeholder-shown:text-xs
          "
        >
          Username or email
        </label>

      </div>

      {/* PASSWORD */}
      <div
        className="
          relative
        "
      >

        <input
          type="password"

          id="password"
          name="password"

          autoComplete="current-password"

          disabled={
            loginMutation.isPending
          }

          value={
            formData.password
          }

          onChange={
            handleChange
          }

          placeholder=" "

          className="
            peer

            w-full

            rounded-2xl

            border
            border-border

            bg-background

            px-4
            pb-3
            pt-6

            text-sm

            text-foreground

            outline-none

            transition-all
            duration-200

            focus:border-accent
            focus:ring-4
            focus:ring-accent/10

            disabled:opacity-60
          "
        />

        <label
          htmlFor="password"
          className="
            pointer-events-none

            absolute
            left-4
            top-1/2

            -translate-y-1/2

            text-sm

            text-muted

            transition-all
            duration-200

            peer-focus:top-4
            peer-focus:text-xs
            peer-focus:text-accent

            peer-not-placeholder-shown:top-4
            peer-not-placeholder-shown:text-xs
          "
        >
          Password
        </label>

      </div>

      {/* FORGOT */}
      <div
        className="
          text-right
        "
      >

        <Link
          to="/forgot-password"
          className="
            text-sm

            text-accent

            transition-opacity
            duration-200

            hover:opacity-80
          "
        >
          Forgot password?
        </Link>

      </div>

      {/* BUTTON */}
      <button
        type="submit"

        disabled={
          loginMutation.isPending
        }

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

        {loginMutation.isPending
          ? "Logging in..."
          : "Login"}

      </button>

      {/* FOOTER */}
      <div
        className="
          text-center
        "
      >

        <p
          className="
            text-sm

            text-muted
          "
        >
          Don&apos;t have an account?

          <Link
            to="/auth/signup"
            className="
              ml-1

              font-medium

              text-accent

              transition-opacity
              duration-200

              hover:opacity-80
            "
          >
            Create one
          </Link>

        </p>

      </div>

    </form>
  );
};

export default Login;