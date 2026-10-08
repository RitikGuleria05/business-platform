import {
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    Moon,
    Sun,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { authStorage } from "../../services/authStorage";
import { logout } from "../../services/authService";

interface TopNavbarProps {
    onMenuClick: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const pageInfo: Record<
    string,
    {
        title: string;
        description: string;
    }
> = {
    "/dashboard": {
        title: "Dashboard",
        description: "Overview of your business",
    },
    "/products": {
        title: "Products",
        description: "Manage your products",
    },
    "/inventory": {
        title: "Inventory",
        description: "Manage your inventory",
    },
    "/customers": {
        title: "Customers",
        description: "Manage your customers",
    },
    "/sales": {
        title: "Sales",
        description: "Manage your sales",
    },
    "/reports": {
        title: "Reports",
        description: "View business reports and analytics",
    },
    "/settings": {
        title: "Settings",
        description: "Manage your account settings",
    },
    "/settings/change-password": {
        title: "Change Password",
        description: "Update your account password",
    },
};

function TopNavbar({
    onMenuClick,
    onToggleSidebar,
    isSidebarOpen,
    isSidebarCollapsed,
    isDarkMode,
    onToggleTheme,
}: TopNavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authStorage.getUser();

    const currentPage =
        pageInfo[location.pathname] ?? {
            title: "BusinessPlatform",
            description: "",
        };

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

    const userInitial =
        user?.userName?.charAt(0).toUpperCase() ?? "U";

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={
                        isSidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    title={
                        isSidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:inline-flex"
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label={
                        isSidebarOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={isSidebarOpen}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {currentPage.title}
                    </h2>

                    {currentPage.description && (
                        <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
                            {currentPage.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label={
                        isDarkMode
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                    title={
                        isDarkMode
                            ? "Light mode"
                            : "Dark mode"
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    {isDarkMode ? (
                        <Sun className="h-[18px] w-[18px]" />
                    ) : (
                        <Moon className="h-[18px] w-[18px]" />
                    )}
                </button>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <Bell className="h-[18px] w-[18px]" />

                    <span
                        className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"
                        aria-hidden="true"
                    />
                </button>

                <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden text-right md:block">
                        <p className="max-w-40 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user?.userName ?? "User"}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user?.role ?? "Employee"}
                        </p>
                    </div>

                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 dark:ring-indigo-500/20"
                        aria-hidden="true"
                    >
                        {userInitial}
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        aria-label="Logout"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                        <LogOut className="h-[18px] w-[18px]" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default TopNavbar;