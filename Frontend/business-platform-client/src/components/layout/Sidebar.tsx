import { useEffect, useState } from "react";
import {
    BarChart3,
    Boxes,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Tags,
    Users,
    X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/AuthContext";
import navbarLogo from "../../assets/navbar-logo.svg";
import appIcon from "../../assets/app-icon.svg";

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
}

const navigationItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        permission: undefined,
    },
    {
        name: "Categories",
        path: "/categories",
        icon: Tags,
        permission: "Category.View",
    },
    {
        name: "Products",
        path: "/products",
        icon: Package,
        permission: "Product.View",
    },
    {
        name: "Inventory",
        path: "/inventory",
        icon: Boxes,
        permission: "Inventory.View",
    },
    {
        name: "Customers",
        path: "/customers",
        icon: Users,
        permission: "Customer.View",
    },
    {
        name: "Sales",
        path: "/sales",
        icon: ShoppingCart,
        permission: "sales.read",
    },
];

function Sidebar({
    isOpen,
    isCollapsed,
    onClose,
}: SidebarProps) {
    const { hasPermission } = useAuth();
    const location = useLocation();

    const isReportsRoute = location.pathname.startsWith("/reports");

    const [isReportsOpen, setIsReportsOpen] = useState(isReportsRoute);

    useEffect(() => {
        if (isReportsRoute) {
            setIsReportsOpen(true);
        }
    }, [isReportsRoute]);

    const visibleItems = navigationItems.filter(
        (item) =>
            !item.permission ||
            hasPermission(item.permission)
    );

    const hasAnyReportPermission =
        hasPermission("reports.products") ||
        hasPermission("reports.inventory") ||
        hasPermission("reports.sales") ||
        hasPermission("reports.customers");

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-200 lg:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-50 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:static lg:h-dvh lg:translate-x-0 ${
                    isCollapsed
                        ? "lg:w-20"
                        : "lg:w-64"
                }`}
                aria-label="Main navigation"
            >
                <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-800">
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className={`flex items-center ${
                            isCollapsed ? "lg:mx-auto" : ""
                        }`}
                        aria-label="BusinessPlatform dashboard"
                    >
                        <div
                            className={`flex items-center ${
                                isCollapsed
                                    ? "lg:h-10 lg:w-10 lg:justify-center"
                                    : "rounded-lg bg-white px-2 py-1"
                            }`}
                        >
                            <img
                                src={navbarLogo}
                                alt="BusinessPlatform"
                                className={`h-8 w-auto object-contain ${
                                    isCollapsed
                                        ? "hidden"
                                        : "block"
                                }`}
                            />

                            <img
                                src={appIcon}
                                alt="BusinessPlatform"
                                className={`h-9 w-9 object-contain ${
                                    isCollapsed
                                        ? "block"
                                        : "hidden"
                                }`}
                            />
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation menu"
                        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav
                    className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
                    aria-label="Primary navigation"
                >
                    <div className="space-y-1">
                        {visibleItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    title={
                                        isCollapsed
                                            ? item.name
                                            : undefined
                                    }
                                    className={({ isActive }) =>
                                        `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                            isCollapsed
                                                ? "lg:justify-center lg:px-2"
                                                : ""
                                        } ${
                                            isActive
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        }`
                                    }
                                >
                                    <Icon
                                        className="h-[18px] w-[18px] shrink-0"
                                        strokeWidth={1.8}
                                    />

                                    <span
                                        className={`truncate ${
                                            isCollapsed
                                                ? "lg:hidden"
                                                : ""
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </NavLink>
                            );
                        })}

                        {hasAnyReportPermission && (
                            <div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsReportsOpen(
                                            (current) => !current
                                        )
                                    }
                                    title={
                                        isCollapsed
                                            ? "Reports"
                                            : undefined
                                    }
                                    aria-expanded={isReportsOpen}
                                    className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${
                                        isCollapsed
                                            ? "lg:justify-center lg:px-2"
                                            : ""
                                    }`}
                                >
                                    <BarChart3
                                        className="h-[18px] w-[18px] shrink-0"
                                        strokeWidth={1.8}
                                    />

                                    <span
                                        className={`flex min-w-0 flex-1 items-center justify-between ${
                                            isCollapsed
                                                ? "lg:hidden"
                                                : ""
                                        }`}
                                    >
                                        <span className="truncate">
                                            Reports
                                        </span>

                                        {isReportsOpen ? (
                                            <ChevronDown className="h-4 w-4 shrink-0" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 shrink-0" />
                                        )}
                                    </span>
                                </button>

                                {isReportsOpen && !isCollapsed && (
                                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                                        {hasPermission(
                                            "reports.products"
                                        ) && (
                                            <NavLink
                                                to="/reports/products"
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                        isActive
                                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                                            : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                Products
                                            </NavLink>
                                        )}

                                        {hasPermission(
                                            "reports.inventory"
                                        ) && (
                                            <NavLink
                                                to="/reports/inventory"
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                        isActive
                                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                                            : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                Inventory
                                            </NavLink>
                                        )}

                                        {hasPermission(
                                            "reports.sales"
                                        ) && (
                                            <NavLink
                                                to="/reports/sales"
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                        isActive
                                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                                            : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                Sales
                                            </NavLink>
                                        )}

                                        {hasPermission(
                                            "reports.customers"
                                        ) && (
                                            <NavLink
                                                to="/reports/customers"
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                        isActive
                                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                                            : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                Customers
                                            </NavLink>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        title={
                            isCollapsed
                                ? "Settings"
                                : undefined
                        }
                        className={({ isActive }) =>
                            `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                isCollapsed
                                    ? "lg:justify-center lg:px-2"
                                    : ""
                            } ${
                                isActive
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            }`
                        }
                    >
                        <Settings
                            className="h-[18px] w-[18px] shrink-0"
                            strokeWidth={1.8}
                        />

                        <span
                            className={
                                isCollapsed
                                    ? "lg:hidden"
                                    : ""
                            }
                        >
                            Settings
                        </span>
                    </NavLink>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;