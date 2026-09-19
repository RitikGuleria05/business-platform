import {BarChart3,Boxes,DollarSign,ShoppingCart,Users} from "lucide-react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/dashboard/StatCard";
import RecentSales from "../../components/dashboard/RecentSales";
import QuickActions from "../../components/dashboard/QuickActions";

function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Here's what's happening with your business today.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Sales"
                    value="$24,580"
                    change="+12.5%"
                    icon={DollarSign}
                    positive
                />

                <StatCard
                    title="Total Orders"
                    value="1,248"
                    change="+8.2%"
                    icon={ShoppingCart}
                    positive
                />

                <StatCard
                    title="Customers"
                    value="856"
                    change="+5.4%"
                    icon={Users}
                    positive
                />

                <StatCard
                    title="Low Stock"
                    value="18"
                    change="Needs attention"
                    icon={Boxes}
                    positive={false}
                />
            </div>

            {/* Sales + Quick Actions */}
            <div className="grid gap-6 xl:grid-cols-3">
                <RecentSales />
                <QuickActions />
            </div>

            {/* Business Overview */}
            <Card>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Business Overview
                        </h2>

                        <p className="text-xs text-slate-500">
                            Detailed analytics will appear here.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Dashboard;