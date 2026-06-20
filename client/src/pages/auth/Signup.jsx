import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSignupMutation } from "../../hooks/auth/useSignupMutation.js";
import { checkUsername } from "../../services/authService.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const Signup = () => {
    const navigate = useNavigate();
    const signupMutation = useSignupMutation();

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        fullName: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const [error, setError] = useState({
        general: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [usernameAvailability, setUsernameAvailability] = useState({
        status: "idle", // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
        message: "",
    });

    // Check username availability with debounce
    useEffect(() => {
        const username = formData.username.trim();
        if (!username) {
            setUsernameAvailability({ status: "idle", message: "" });
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
    }, [formData.username]);

    // Password validation flags
    const isPasswordValid =
        formData.password.length >= 8 &&
        /[A-Z]/.test(formData.password) &&
        /[a-z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[\W_]/.test(formData.password);

    // Form validity check
    const isFormValid =
        formData.fullName.trim().length >= 2 &&
        formData.fullName.trim().length <= 50 &&
        usernameAvailability.status === "available" &&
        emailRegex.test(formData.email) &&
        isPasswordValid &&
        formData.password === formData.confirmPassword;

    // INPUT CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        setError((prev) => ({
            ...prev,
            general: "",
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));
    };

    // SUBMIT
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid) {
            return;
        }

        setError({ general: "" });

        const payload = {
            fullName: formData.fullName.trim(),
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
        };

        signupMutation.mutate(
            payload,
            {
                onSuccess: () => navigate("/"),
                onError: (error) => {
                    const message =
                        error.response?.data?.errors?.[0]?.message ||
                        error.response?.data?.message ||
                        "Signup failed";

                    setError({ general: message });
                },
            }
        );
    };

    // CSS Classes for borders dynamically
    const fullNameBorderClass = touched.fullName && (
        !formData.fullName.trim() ||
        formData.fullName.trim().length < 2 ||
        formData.fullName.trim().length > 50
    ) ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent";

    const usernameBorderClass = touched.username && usernameAvailability.status === "available"
        ? "border-emerald-500 focus:border-emerald-500"
        : touched.username && (usernameAvailability.status === "taken" || usernameAvailability.status === "invalid")
        ? "border-red-500 focus:border-red-500"
        : "border-border focus:border-accent";

    const emailBorderClass = touched.email && (!formData.email.trim() || !emailRegex.test(formData.email))
        ? "border-red-500 focus:border-red-500"
        : "border-border focus:border-accent";

    const passwordBorderClass = touched.password && !isPasswordValid
        ? "border-red-500 focus:border-red-500"
        : touched.password && isPasswordValid
        ? "border-emerald-500 focus:border-emerald-500"
        : "border-border focus:border-accent";

    const confirmPasswordBorderClass = touched.confirmPassword && formData.password !== formData.confirmPassword
        ? "border-red-500 focus:border-red-500"
        : touched.confirmPassword && formData.password === formData.confirmPassword && isPasswordValid
        ? "border-emerald-500 focus:border-emerald-500"
        : "border-border focus:border-accent";

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] border border-border bg-surface/90 p-6 shadow-xl backdrop-blur-xl transition-colors duration-300 sm:p-6 2xl:p-8"
        >
            {/* ERROR */}
            {error.general && (
                <div className="px-4 py-3 text-sm text-red-500 border rounded-2xl border-red-500/20 bg-red-500/10">
                    {error.general}
                </div>
            )}

            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Create account
                </h1>
                <p className="mt-2 text-sm text-muted sm:text-base">
                    Start chatting with people instantly
                </p>
            </div>

            {/* FULL NAME */}
            <div className="relative">
                <input
                    type="text"
                    autoFocus
                    id="fullName"
                    name="fullName"
                    autoComplete="off"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                    placeholder=" "
                    className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base ${fullNameBorderClass}`}
                />
                <label
                    htmlFor="fullName"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Full name
                </label>
                {touched.fullName && (
                    !formData.fullName.trim() ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Full name is required
                        </p>
                    ) : formData.fullName.trim().length < 2 ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Full name must be at least 2 characters
                        </p>
                    ) : formData.fullName.trim().length > 50 ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Full name must be at most 50 characters
                        </p>
                    ) : null
                )}
            </div>

            {/* USERNAME */}
            <div className="relative">
                <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="off"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                    placeholder=" "
                    className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base ${usernameBorderClass}`}
                />
                <label
                    htmlFor="username"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Username
                </label>
                {touched.username && (
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

            {/* EMAIL */}
            <div className="relative">
                <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                    placeholder=" "
                    className={`w-full px-4 pt-6 pb-3 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base ${emailBorderClass}`}
                />
                <label
                    htmlFor="email"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Email
                </label>
                {touched.email && (
                    !formData.email.trim() ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Email is required
                        </p>
                    ) : !emailRegex.test(formData.email) ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Please enter a valid email
                        </p>
                    ) : null
                )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                    placeholder=" "
                    className={`w-full px-4 pt-6 pb-3 pr-12 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base ${passwordBorderClass}`}
                />
                <label
                    htmlFor="password"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute -translate-y-1/2 right-4 top-1/2"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* PASSWORD CHECKLIST */}
            <PasswordChecklist password={formData.password} touched={touched.password} />

            {/* CONFIRM PASSWORD */}
            <div className="relative">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="off"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                    placeholder=" "
                    className={`w-full px-4 pt-6 pb-3 pr-12 text-sm transition-all duration-200 border outline-none peer rounded-2xl bg-background text-foreground focus:ring-4 focus:ring-accent/10 disabled:opacity-60 sm:text-base ${confirmPasswordBorderClass}`}
                />
                <label
                    htmlFor="confirmPassword"
                    className="absolute text-sm transition-all duration-200 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-muted peer-focus:top-4 peer-focus:text-xs peer-focus:text-accent peer-not-placeholder-shown:top-4 peer-not-placeholder-shown:text-xs"
                >
                    Confirm Password
                </label>
                {touched.confirmPassword && (
                    formData.password !== formData.confirmPassword ? (
                        <p className="mt-1 ml-1 text-xs text-red-500">
                            Passwords do not match
                        </p>
                    ) : isPasswordValid ? (
                        <p className="mt-1 ml-1 text-xs text-emerald-500">
                            Passwords match
                        </p>
                    ) : null
                )}
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute -translate-y-1/2 right-4 top-1/2"
                >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* BUTTON */}
            <button
                type="submit"
                disabled={signupMutation.isPending || !isFormValid}
                className="w-full cursor-pointer rounded-2xl bg-accent px-5 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
            >
                {signupMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Creating account...
                    </div>
                ) : (
                    "Create account"
                )}
            </button>

            {/* FOOTER */}
            <div className="text-center">
                <p className="text-sm text-muted sm:text-base">
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