import { useRef, useState, type FormEvent } from "react";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    LogIn,
    Mail,
    User,
    UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { authStorage } from "../../services/authStorage";
import {
    getUserPermissions,
    login,
    register,
} from "../../services/authService";
import { useAuth } from "../../hooks/auth/AuthContext";

import appIcon from "../../assets/app-icon-1024.png";

import {
    Turnstile,
    type TurnstileInstance,
} from "@marsidev/react-turnstile";

function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const turnstileRef = useRef<TurnstileInstance>(null);

    /*
     * Login state
     */
    const rememberedEmail = authStorage.getRememberedEmail();

    const [email, setEmail] = useState(
        rememberedEmail ?? ""
    );

    const [password, setPassword] = useState("");

    const [rememberMe, setRememberMe] = useState(
        rememberedEmail !== null
    );

    const [showPassword, setShowPassword] = useState(false);

    /*
     * Register state
     */
    const [userName, setUserName] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [turnstileToken, setTurnstileToken] = useState("");

    /*
     * Common state
     */
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    /*
     * Login
     */
    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!email || !password) {
            setError(
                "Please enter your email and password."
            );
            return;
        }

        try {
            setLoading(true);

            const result = await login({
                email,
                password,
            });

            authStorage.saveAuth(result);

            const permissions = await getUserPermissions();

            authStorage.savePermissions(permissions);

            setAuth(
                {
                    userName: result.userName,
                    role: result.role,
                },
                result.token,
                permissions
            );

            if (rememberMe) {
                authStorage.saveRememberedEmail(email);
            } else {
                authStorage.clearRememberedEmail();
            }

            navigate("/dashboard");
        } catch (error) {
            console.error(error);

            setError(
                "Unable to create account. Please try again."
            );

            setTurnstileToken("");

            turnstileRef.current?.reset();
        } finally {
            setLoading(false);
        }
    };

    /*
     * Register
     */
    const handleRegister = async (event: FormEvent) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !userName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!turnstileToken) {
            setError(
                "Please complete the security verification."
            );
            return;
        }

        try {
            setLoading(true);

            await register({
                userName,
                email,
                password,
                turnstileToken,
            });

            setSuccess(
                "Account created successfully. You can now sign in."
            );

            /*
             * Clear registration fields
             */
            setUserName("");
            setPassword("");
            setConfirmPassword("");
            setTurnstileToken("");

            /*
             * Switch back to login
             */
            setIsRegisterMode(false);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Switch between login/register
     */
    const switchMode = () => {
        setIsRegisterMode(
            (previous) => !previous
        );

        setError("");
        setSuccess("");
        setPassword("");
        setConfirmPassword("");
        setTurnstileToken("");
    };

    return (
        <div className="h-dvh w-full overflow-hidden bg-slate-950">
            <div className="flex h-full w-full">
                {/* =========================================================
                LEFT BRANDING PANEL
                Hidden on smaller screens
            ========================================================= */}
                <div className="relative hidden w-[42%] overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
                    {/* Subtle decorative shapes */}
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

                    {/* Brand */}
                    <div className="relative z-10 p-10 xl:p-12">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5">
                                <img
                                    src={appIcon}
                                    alt="BusinessPlatform"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold tracking-wide text-white">
                                    BusinessPlatform
                                </p>

                                <p className="text-xs text-slate-500">
                                    Business operations made simple
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main branding content */}
                    <div className="relative z-10 px-10 pb-16 xl:px-12">
                        <div className="max-w-md">
                            <p className="mb-4 text-sm font-medium text-indigo-400">
                                BUSINESS MANAGEMENT PLATFORM
                            </p>

                            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                                Everything your business needs,
                                <span className="text-indigo-400">
                                    {" "}
                                    in one place.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                                Manage products, inventory, customers,
                                sales and business insights from one
                                simple platform.
                            </p>

                            {/* Small feature indicators */}
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-200">
                                        Inventory
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Stay in control
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-200">
                                        Sales
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Track every order
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-200">
                                        Customers
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Build relationships
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-200">
                                        Reports
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Understand your business
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 px-10 pb-8 xl:px-12">
                        <p className="text-xs text-slate-600">
                            © {new Date().getFullYear()} BusinessPlatform
                        </p>
                    </div>
                </div>

                {/* =========================================================
                RIGHT AUTH AREA
            ========================================================= */}
                <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6 lg:overflow-hidden">
                    <div className="w-full max-w-[440px] min-w-0">
                        {/* Mobile Logo */}
                        <div className="mb-5 flex justify-center lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 p-1.5 shadow-sm">
                                <img
                                    src={appIcon}
                                    alt="BusinessPlatform"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>

                        {/* =================================================
                        AUTH CARD
                    ================================================= */}
                        <div
                            key={
                                isRegisterMode
                                    ? "register"
                                    : "login"
                            }
                            className="w-full min-w-0 max-h-[calc(100dvh-24px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-[slideUp_0.35s_ease-out] sm:max-h-[calc(100dvh-32px)] sm:p-5 md:p-6"
                        >
                            {/* Card Header */}
                            <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                            {isRegisterMode
                                                ? "Create your account"
                                                : "Welcome back"}
                                        </h1>

                                        <p className="mt-1.5 text-sm leading-5 text-slate-500">
                                            {isRegisterMode
                                                ? "Start managing your business with BusinessPlatform."
                                                : "Sign in to continue to your dashboard."}
                                        </p>
                                    </div>

                                    {/* Small icon */}
                                    <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:flex">
                                        {isRegisterMode ? (
                                            <UserPlus className="h-4 w-4" />
                                        ) : (
                                            <LogIn className="h-4 w-4" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="px-5 py-5 sm:px-7 sm:py-6">
                                {/* Error */}
                                {error && (
                                    <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
                                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Success */}
                                {success && (
                                    <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm leading-5 text-green-700">
                                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />

                                        <span>{success}</span>
                                    </div>
                                )}

                                {/* =================================================
                                REGISTER FORM
                            ================================================= */}
                                {isRegisterMode ? (
                                    <form
                                        onSubmit={handleRegister}
                                        className="space-y-4 pb-2"
                                    >
                                        {/* Username */}
                                        <div>
                                            <label
                                                htmlFor="userName"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Username
                                            </label>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="userName"
                                                    type="text"
                                                    value={userName}
                                                    onChange={(event) =>
                                                        setUserName(event.target.value)
                                                    }
                                                    placeholder="Enter your username"
                                                    autoComplete="username"
                                                    className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="register-email"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Email address
                                            </label>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="register-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) =>
                                                        setEmail(event.target.value)
                                                    }
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label
                                                htmlFor="register-password"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Password
                                            </label>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <Lock className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="register-password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(event) =>
                                                        setPassword(event.target.value)
                                                    }
                                                    placeholder="Create a password"
                                                    autoComplete="new-password"
                                                    className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-12 pr-11 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (previous) => !previous
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label
                                                htmlFor="confirm-password"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Confirm password
                                            </label>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <Lock className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="confirm-password"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={confirmPassword}
                                                    onChange={(event) =>
                                                        setConfirmPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Confirm your password"
                                                    autoComplete="new-password"
                                                    className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-12 pr-11 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            (previous) => !previous
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide confirm password"
                                                            : "Show confirm password"
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Turnstile */}
                                        <div className="flex w-full min-w-0 justify-center overflow-hidden py-1">
                                            <Turnstile
                                                ref={turnstileRef}
                                                siteKey={
                                                    import.meta.env
                                                        .VITE_TURNSTILE_SITE_KEY
                                                }
                                                onSuccess={(token) => {
                                                    setTurnstileToken(token);
                                                }}
                                                onExpire={() => {
                                                    setTurnstileToken("");
                                                }}
                                                onError={() => {
                                                    setTurnstileToken("");
                                                }}
                                            />
                                        </div>

                                        {/* Register Button */}
                                        <button
                                            type="submit"
                                            disabled={
                                                loading ||
                                                !turnstileToken
                                            }
                                            className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <UserPlus className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

                                            {loading
                                                ? "Creating account..."
                                                : "Create account"}
                                        </button>
                                    </form>
                                ) : (
                                    /* =================================================
                                        LOGIN FORM
                                    ================================================= */
                                    <form
                                        onSubmit={handleLogin}
                                        className="space-y-4"
                                    >
                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Email address
                                            </label>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) =>
                                                        setEmail(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <label
                                                    htmlFor="password"
                                                    className="text-xs font-semibold text-slate-700"
                                                >
                                                    Password
                                                </label>
                                            </div>

                                            <div className="group relative">
                                                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-600">
                                                    <Lock className="h-3.5 w-3.5" />
                                                </div>

                                                <input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(event) =>
                                                        setPassword(
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-11 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (previous) =>
                                                                !previous
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember Me */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(event) =>
                                                        setRememberMe(
                                                            event.target.checked
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />

                                                <span className="text-sm text-slate-600">
                                                    Remember me
                                                </span>
                                            </label>
                                        </div>

                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />

                                            {loading
                                                ? "Signing in..."
                                                : "Sign in"}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* =================================================
                            MODE SWITCH
                        ================================================= */}
                            <div className="border-t border-slate-100 px-5 py-4 text-center sm:px-7">
                                {isRegisterMode ? (
                                    <button
                                        type="button"
                                        onClick={switchMode}
                                        className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <ArrowLeft className="h-4 w-4" />

                                        Back to sign in
                                    </button>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Don't have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={switchMode}
                                            className="font-semibold text-indigo-600 transition hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            Create account
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Mobile footer */}
                        <p className="mt-4 text-center text-xs text-slate-400 lg:hidden">
                            © {new Date().getFullYear()} BusinessPlatform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;