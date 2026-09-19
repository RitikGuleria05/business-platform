import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

function Settings() {
    return (
        <div className="max-w-3xl">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your account settings.
                </p>
            </div>


            {/* Settings options */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <Link
                    to="/settings/change-password"
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                >

                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Lock className="h-5 w-5" />
                    </div>


                    {/* Text */}
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Change Password
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Update your account password.
                        </p>
                    </div>

                </Link>

            </div>

        </div>
    );
}

export default Settings;
//For a production-quality authentication system, after changing the password we should generally consider:
//We don't have to implement that right now, but I would put it on our authentication hardening list.