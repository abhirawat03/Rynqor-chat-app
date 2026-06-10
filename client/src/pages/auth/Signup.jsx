import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSignupMutation } from "../../hooks/auth/useSignupMutation.js";

const initialErrors = {
    fullName: "",
    username: "",
    email: "",
    password: "",
    general: "",
};
const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            useState(initialErrors);

    const [showPassword, setShowPassword] =
        useState(false);

    const isFormValid =
        formData.fullName.trim() &&
        formData.username.trim().length >= 3 &&
        emailRegex.test(
            formData.email
        ) &&
        formData.password.length >= 8;
    // INPUT CHANGE
    const handleChange = (
        e
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError((prev) => ({
            ...prev,
            [name]: "",
            general: "",
        }));

    };

    // SUBMIT

    const validateForm = () => {

        const newErrors = {
            ...initialErrors,
        };

        if (!formData.fullName.trim()) {
            newErrors.fullName =
                "Full name is required";
        }

        if (!formData.username.trim()) {
            newErrors.username =
                "Username is required";
        } else if (
            formData.username.length < 3
        ) {
            newErrors.username =
                "Username must be at least 3 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email =
                "Email is required";
        } else if (
            !emailRegex.test(formData.email)
        ) {
            newErrors.email =
                "Please enter a valid email";
        }

        if (!formData.password.trim()) {
            newErrors.password =
                "Password is required";
        } else if (
            formData.password.length < 8
        ) {
            newErrors.password =
                "Password must be at least 8 characters";
        }

        setError(newErrors);

        return !Object.values(newErrors)
            .some(Boolean);
    };
    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setError(initialErrors);

        const payload = {
            fullName:
                formData.fullName.trim(),
            username:
                formData.username.trim(),
            email:
                formData.email
                    .trim()
                    .toLowerCase(),
            password:
                formData.password,
        };

        signupMutation.mutate(
            payload,
            {
                onSuccess: () =>
                    navigate("/"),

                onError: (error) => {

                    const message =
                        error.response?.data?.errors?.[0]?.message ||
                        error.response?.data?.message ||
                        "Signup failed";

                    setError((prev) => ({
                        ...prev,
                        general: message,
                    }));
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
            {error.general && (
                <div
                    className="px-4 py-3 text-sm text-red-500 border rounded-2xl border-red-500/20 bg-red-500/10"
                >
                    {error.general}
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
                    autoFocus

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
                {error.fullName && (
                    <p
                        className="mt-1 text-sm text-red-500 "
                    >
                        {error.fullName}
                    </p>
                )}

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
                {error.username && (
                    <p
                        className="mt-1 text-sm text-red-500 "
                    >
                        {error.username}
                    </p>
                )}
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
                {error.email && (
                    <p
                        className="mt-1 text-sm text-red-500 "
                    >
                        {error.email}
                    </p>
                )}

            </div>


            {/* PASSWORD */}
            <div
                className="relative "
            >

                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }

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

                    className="w-full px-4 pt-6 pb-3 pr-12 text-sm transition-all duration-200 border outline-none peer rounded-2xl border-border bg-background text-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base"
                />

                <label
                    htmlFor="password"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Password
                </label>
                {error.password && (
                    <p
                        className="mt-1 text-sm text-red-500 "
                    >
                        {error.password}
                    </p>
                )}
                <button
                    type="button"

                    onClick={() =>
    setShowPassword(prev => !prev)
}
                    className="absolute -translate-y-1/2 right-4 top-1/2"
                >
                    {showPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />
                    }
                </button>

            </div>

            {/* BUTTON */}
            <button
                type="submit"

                disabled={
                    signupMutation.isPending ||
                    !isFormValid
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

                {
                    signupMutation.isPending
                        ? (
                            <div
                                className="flex items-center justify-center gap-2 "
                            >
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                Creating account...
                            </div>
                        )
                        : (
                            "Create account"
                        )
                }

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