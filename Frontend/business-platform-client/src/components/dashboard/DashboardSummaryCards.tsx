import DashboardSummaryCard from "./DashboardSummaryCard";
import type { DashboardSummary } from "../../types/reports/reports";

interface DashboardSummaryCardsProps {
    data: DashboardSummary;
}

function DashboardSummaryCards({
    data,
}: DashboardSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardSummaryCard
                title="Today's Sales"
                value={`₹${data.todaySales.toLocaleString("en-IN")}`}
            />

            <DashboardSummaryCard
                title="Today's Orders"
                value={data.todayOrders}
            />

            <DashboardSummaryCard
                title="Today's Returns"
                value={`₹${data.todayReturns.toLocaleString("en-IN")}`}
            />

            <DashboardSummaryCard
                title="Total Customers"
                value={data.totalCustomers}
            />

            <DashboardSummaryCard
                title="Total Products"
                value={data.totalProducts}
            />

            <DashboardSummaryCard
                title="Low Stock"
                value={data.lowStockProducts}
            />

            <DashboardSummaryCard
                title="Out of Stock"
                value={data.outOfStockProducts}
            />
        </div>
    );
}

export default DashboardSummaryCards;