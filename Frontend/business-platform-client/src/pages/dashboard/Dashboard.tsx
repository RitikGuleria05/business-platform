import DashboardSummaryCards from "../../components/dashboard/DashboardSummaryCards";
import TopProducts from "../../components/dashboard/TopProducts";
import LowStockProducts from "../../components/dashboard/LowStockProducts";
import { useDashboard } from "../../hooks/dashboard/useDashboard";
import { useTopProducts } from "../../hooks/dashboard/useTopProducts";
import { useLowStock } from "../../hooks/dashboard/useLowStock";

function DashboardPage() {
    const {
        data,
        loading,
        error,
        refetch,
    } = useDashboard();

    const {
        data: topProducts,
        loading: topProductsLoading,
        error: topProductsError,
        refetch: refetchTopProducts,
    } = useTopProducts(5);

    const {
        data: lowStockProducts,
        loading: lowStockLoading,
        error: lowStockError,
        refetch: refetchLowStock,
    } = useLowStock();

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />

                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refetch}
                    className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    No dashboard data available.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-slate-50">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Overview of your business today.
                </p>
            </div>

            {/* Summary Cards */}
            <DashboardSummaryCards data={data} />

            {/* Top Products */}
            {topProductsLoading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />

                        <div className="h-4 w-56 rounded bg-slate-100 dark:bg-slate-800/70" />
                    </div>
                </div>
            )}

            {topProductsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {topProductsError}
                    </p>

                    <button
                        type="button"
                        onClick={refetchTopProducts}
                        className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!topProductsLoading && !topProductsError && (
                <TopProducts products={topProducts} />
            )}

            {/* Low Stock Products */}
            {lowStockLoading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />

                        <div className="h-4 w-64 rounded bg-slate-100 dark:bg-slate-800/70" />
                    </div>
                </div>
            )}

            {lowStockError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {lowStockError}
                    </p>

                    <button
                        type="button"
                        onClick={refetchLowStock}
                        className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!lowStockLoading && !lowStockError && (
                <LowStockProducts products={lowStockProducts} />
            )}
        </div>
    );
}

export default DashboardPage;