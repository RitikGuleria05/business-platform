import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);

        localStorage.setItem(
            "theme",
            isDarkMode ? "dark" : "light"
        );
    }, [isDarkMode]);

    const handleOpenSidebar = () => {
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed((current) => !current);
    };

    const handleToggleTheme = () => {
        setIsDarkMode((current) => !current);
    };

    return (
        <div className="flex h-dvh min-h-0 overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onClose={handleCloseSidebar}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <TopNavbar
                    onMenuClick={handleOpenSidebar}
                    onToggleSidebar={handleToggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                    isSidebarCollapsed={isSidebarCollapsed}
                    isDarkMode={isDarkMode}
                    onToggleTheme={handleToggleTheme}
                />

                <main className="min-h-0 flex-1 overflow-y-auto bg-slate-100 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 xl:px-8 dark:bg-slate-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;