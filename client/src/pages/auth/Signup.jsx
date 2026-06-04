import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { useSignupMutation }
    from "../../hooks/auth/useSignupMutation.js";

const Signup = () => {

    const navigate =
        useNavigate();

    const signupMutation =
        useSignupMutation();

    const [formData, setFormData] =
        useState({
            fullName: "",
            username: "",
            email: "",
            password: "",
        });

    const [error, setError] =
        useState("");

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
            fullName,
            username,
            email,
            password,
        } = formData;

        if (
            !fullName.trim() ||
            !username.trim() ||
            !email.trim() ||
            !password.trim()
        ) {

            setError(
                "All fields are required"
            );

            return;

        }

        if (
            username.length < 3
        ) {

            setError(
                "Username must be at least 3 characters"
            );

            return;

        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(email)
        ) {

            setError(
                "Please enter a valid email address"
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

        signupMutation.mutate(
            formData,
            {

                onSuccess: () =>
                    navigate("/"),

                onError: (
                    error
                ) => {

                    const message =
                        error.response?.data
                            ?.message ||
                        "Signup failed";

                    setError(
                        message
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

        rounded-[28px]

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
                    className="px-4 py-3 text-sm text-red-500 border rounded-2xl border-red-500/20 bg-red-500/10"
                >
                    {error}
                </div>

            )}

            {/* HEADER */}
            <div
                className="text-center "
            >

                <h1
                    className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                    Create account
                </h1>

                <p
                    className="mt-2 text-sm text-muted sm:text-base"
                >
                    Start chatting with people instantly
                </p>

            </div>

            {/* FULL NAME */}
            <div
                className="relative "
            >

                <input
                    type="text"

                    id="fullName"
                    name="fullName"

                    autoComplete="name"

                    value={
                        formData.fullName
                    }

                    onChange={
                        handleChange
                    }

                    disabled={
                        signupMutation.isPending
                    }

                    placeholder=" "

                    className="w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base"
                />

                <label
                    htmlFor="fullName"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Full name
                </label>

            </div>

            {/* USERNAME */}
            <div
                className="relative "
            >

                <input
                    type="text"

                    id="username"
                    name="username"

                    autoComplete="username"

                    value={
                        formData.username
                    }

                    onChange={
                        handleChange
                    }

                    disabled={
                        signupMutation.isPending
                    }

                    placeholder=" "

                    className="w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base"
                />

                <label
                    htmlFor="username"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Username
                </label>

            </div>

            {/* EMAIL */}
            <div
                className="relative "
            >

                <input
                    type="email"

                    id="email"
                    name="email"

                    autoComplete="email"

                    value={
                        formData.email
                    }

                    onChange={
                        handleChange
                    }

                    disabled={
                        signupMutation.isPending
                    }

                    placeholder=" "

                    className="w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base"
                />

                <label
                    htmlFor="email"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Email
                </label>

            </div>

            {/* PASSWORD */}
            <div
                className="relative "
            >

                <input
                    type="password"

                    id="password"
                    name="password"

                    autoComplete="new-password"

                    value={
                        formData.password
                    }

                    onChange={
                        handleChange
                    }

                    disabled={
                        signupMutation.isPending
                    }

                    placeholder=" "

                    className="w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base"
                />

                <label
                    htmlFor="password"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Password
                </label>

            </div>

            {/* BUTTON */}
            <button
                type="submit"

                disabled={
                    signupMutation.isPending
                }

                className="
          w-full
          cursor-pointer

          rounded-2xl

          bg-accent

          px-5
          py-3.5

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

          sm:text-base
        "
            >

                {signupMutation.isPending
                    ? "Creating account..."
                    : "Create account"}

            </button>

            {/* FOOTER */}
            <div
                className="text-center "
            >

                <p
                    className="text-sm text-muted sm:text-base"
                >
                    Already have an account?

                    <Link
                        to="/auth"
                        className="ml-1 font-medium transition-opacity duration-200 text-accent hover:opacity-80"
                    >
                        Sign in
                    </Link>

                </p>

            </div>

        </form>
    );
};

export default Signup;