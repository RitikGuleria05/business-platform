import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* Navbar */}
                <TopNavbar />

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default MainLayout;