import { useState } from "react";
import {Eye,EyeOff,Lock,Save,} from "lucide-react";

import { changePassword } from "../../services/authService";

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError(
                "Please fill in all password fields."
            );

            return;
        }

        if (newPassword !== confirmPassword) {
            setError(
                "New password and confirmation do not match."
            );

            return;
        }

        if (newPassword === currentPassword) {
            setError(
                "New password must be different from your current password."
            );

            return;
        }

        try {
            setLoading(true);

            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess("Password changed successfully.");

        } catch (error) {
            console.error(error);

            setError("Unable to change password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Change Password
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Update your account password.
                </p>
            </div>


            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                            {success}
                        </div>
                    )}


                    {/* Current password */}
                    <PasswordField
                        id="currentPassword"
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        showPassword={showCurrentPassword}
                        setShowPassword={
                            setShowCurrentPassword
                        }
                        autoComplete="current-password"
                    />


                    {/* New password */}
                    <PasswordField
                        id="newPassword"
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        showPassword={showNewPassword}
                        setShowPassword={
                            setShowNewPassword
                        }
                        autoComplete="new-password"
                    />


                    {/* Confirm password */}
                    <PasswordField
                        id="confirmPassword"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        showPassword={showConfirmPassword}
                        setShowPassword={
                            setShowConfirmPassword
                        }
                        autoComplete="new-password"
                    />


                    <div className="pt-2">

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />

                            {loading
                                ? "Changing..."
                                : "Change Password"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

interface PasswordFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    showPassword: boolean;
    setShowPassword: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    autoComplete: string;
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    showPassword,
    setShowPassword,
    autoComplete,
}: PasswordFieldProps) {
    return (
        <div>

            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <div className="relative">

                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    id={id}
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    autoComplete={autoComplete}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                    type="button"
                    onClick={() =>
                        setShowPassword(
                            (previous) => !previous
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
    );
}

export default ChangePassword;