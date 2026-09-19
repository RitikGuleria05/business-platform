import {
    BarChart3,
    Boxes,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Tags,
    Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/auth/AuthContext";

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
        permission: "Sale.View",
    },
    {
        name: "Reports",
        path: "/reports",
        icon: BarChart3,
        permission: "Report.View",
    },
];

function Sidebar() {
    const { hasPermission } = useAuth();

    const visibleItems = navigationItems.filter(
        (item) =>
            !item.permission || hasPermission(item.permission)
    );

    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-slate-200 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                        B
                    </div>

                    <span className="text-lg font-bold text-slate-900">
                        BusinessPlatform
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {visibleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            <Icon className="h-5 w-5" />

                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Settings */}
            <div className="border-t border-slate-200 p-4">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                    }
                >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}

export default Sidebar;