import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { authStorage } from "../../services/authStorage";
import { login, getUserPermissions } from "../../services/authService";
import { useAuth } from "../../hooks/auth/AuthContext";

function Login() {
    const navigate = useNavigate();

    const { setAuth } = useAuth();

    const rememberedEmail = authStorage.getRememberedEmail();

    const [email, setEmail] = useState(rememberedEmail ?? "");

    const [password, setPassword] = useState("");

    const [rememberMe, setRememberMe] = useState(
        rememberedEmail !== null
    );

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setError("");

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

            // Important: if permission request fails after login,
            // clear the partially created authentication state.
            authStorage.clear();

            setError(
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-8 text-center">

                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
                        B
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        BusinessPlatform
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to your account
                    </p>

                </div>


                {/* Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}


                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>

                            <div className="relative">

                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div>

                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* Remember me */}
                        <div className="flex items-center">

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


                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <LogIn className="h-4 w-4" />

                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>

                    </form>

                </div>


                <p className="mt-6 text-center text-xs text-slate-400">
                    BusinessPlatform
                </p>

            </div>

        </div>
    );
}

export default Login;