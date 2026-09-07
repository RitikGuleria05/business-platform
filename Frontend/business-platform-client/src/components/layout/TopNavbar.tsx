import {Bell,LogOut} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authStorage } from "../../services/authStorage";
import { logout } from "../../services/authService";

function TopNavbar() {
    const navigate = useNavigate();

    const user = authStorage.getUser();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            authStorage.clear();

            navigate("/login", {
                replace: true,
            });
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">

            {/* Page information */}
            <div>
                <h2 className="text-sm font-semibold text-slate-900">
                    Dashboard
                </h2>

                <p className="text-xs text-slate-500">
                    Overview of your business
                </p>
            </div>


            {/* Right side */}
            <div className="flex items-center gap-4">

                {/* Notification */}
                <button
                    type="button"
                    className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <Bell className="h-5 w-5" />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>


                {/* User */}
                <div className="flex items-center gap-3">

                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium text-slate-900">
                            {user?.userName ?? "User"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.role ?? "Employee"}
                        </p>
                    </div>


                    {/* Avatar */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {user?.userName?.charAt(0).toUpperCase() ?? "U"}
                    </div>


                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>

                </div>

            </div>

        </header>
    );
}

export default TopNavbar;