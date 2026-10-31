import { useState } from "react";
import { useProductReport } from "../../hooks/reports/useProductReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function ProductReportPage() {
    const today = new Date();

    const formatInputDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const [from, setFrom] = useState(formatInputDate(firstDayOfMonth));
    const [to, setTo] = useState(formatInputDate(today));

    const [appliedFrom, setAppliedFrom] = useState(from);
    const [appliedTo, setAppliedTo] = useState(to);

    const {
        data,
        loading,
        error,
        refetch,
    } = useProductReport(appliedFrom, appliedTo);

    const [filterError, setFilterError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDateTime = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });
    };

    const handleApply = () => {
        if (!from || !to) {
            setFilterError("Please select both dates.");
            return;
        }

        if (from > to) {
            setFilterError("From date cannot be later than To date.");
            return;
        }

        setFilterError(null);
        setAppliedFrom(from);
        setAppliedTo(to);
    };

    const handleExport = async () => {
        if (!appliedFrom || !appliedTo) {
            return;
        }

        try {
            setExporting(true);
            setExportError(null);

            const blob = await reportExportApi.products(
                appliedFrom,
                appliedTo
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `product-report-${appliedFrom}-to-${appliedTo}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch {
            setExportError("Failed to export product report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const cellClass =
        "whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300";

    const headerClass =
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

    return (
        <div className="min-h-full space-y-6 p-4 text-slate-900 dark:text-slate-100 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Product Report
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Analyze product sales, returns, and revenue for a selected period.
                </p>
            </div>

            {/* Date Filters */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
                    <div>
                        <label
                            htmlFor="from"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            From Date
                        </label>

                        <input
                            id="from"
                            type="date"
                            value={from}
                            max={to || undefined}
                            onChange={(event) => setFrom(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:[color-scheme:dark]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="to"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            To Date
                        </label>

                        <input
                            id="to"
                            type="date"
                            value={to}
                            min={from || undefined}
                            max={formatInputDate(today)}
                            onChange={(event) => setTo(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:[color-scheme:dark]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={loading}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-950"
                    >
                        Apply Filters
                    </button>
                </div>

                {filterError && (
                    <p
                        role="alert"
                        className="mt-3 text-sm text-red-600 dark:text-red-400"
                    >
                        {filterError}
                    </p>
                )}
            </section>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Loading product report...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
                    <h2 className="text-base font-semibold text-red-800 dark:text-red-300">
                        Unable to load product report
                    </h2>

                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={refetch}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Report */}
            {!loading && !error && data && (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Report Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Product Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Product performance from{" "}
                                {formatDateTime(appliedFrom)} to{" "}
                                {formatDateTime(appliedTo)}.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={exporting}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            >
                                {exporting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 3v12m0 0 4-4m-4 4-4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
                                            />
                                        </svg>
                                        Export Excel
                                    </>
                                )}
                            </button>

                            {exportError && (
                                <p
                                    role="alert"
                                    className="max-w-xs text-sm text-red-600 dark:text-red-400"
                                >
                                    {exportError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    {data.products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    className="h-6 w-6 text-slate-500 dark:text-slate-400"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9ZM3 7.5l9 4.5m9-4.5-9 4.5m0 0V21m0-9V3"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                                No product data found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                                There are no product records for the selected period.
                                Try selecting a different date range.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Product Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/70">
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                            <th scope="col" className={headerClass}>Product</th>
                                            <th scope="col" className={headerClass}>SKU</th>
                                            <th scope="col" className={headerClass}>Category</th>
                                            <th scope="col" className={headerClass}>Stock</th>
                                            <th scope="col" className={headerClass}>Sold</th>
                                            <th scope="col" className={headerClass}>Gross Revenue</th>
                                            <th scope="col" className={headerClass}>Returned</th>
                                            <th scope="col" className={headerClass}>Return Amount</th>
                                            <th scope="col" className={headerClass}>Net Sold</th>
                                            <th scope="col" className={headerClass}>Net Revenue</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.products.map((product) => (
                                            <tr
                                                key={product.productId}
                                                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                            >
                                                <td className="max-w-xs px-4 py-4">
                                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {product.productName}
                                                    </p>
                                                </td>

                                                <td className={cellClass}>
                                                    {product.sku || "—"}
                                                </td>

                                                <td className={cellClass}>
                                                    {product.categoryName || "—"}
                                                </td>

                                                <td className={cellClass}>
                                                    {product.currentStock.toLocaleString("en-IN")}
                                                </td>

                                                <td className={cellClass}>
                                                    {product.quantitySold.toLocaleString("en-IN")}
                                                </td>

                                                <td className={cellClass}>
                                                    {formatCurrency(product.grossRevenue)}
                                                </td>

                                                <td className={cellClass}>
                                                    {product.quantityReturned.toLocaleString("en-IN")}
                                                </td>

                                                <td className={cellClass}>
                                                    {formatCurrency(product.returnAmount)}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {product.netQuantitySold.toLocaleString("en-IN")}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                    {formatCurrency(product.netRevenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer */}
                            <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40 sm:px-6">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Showing{" "}
                                    <span className="text-slate-900 dark:text-slate-200">
                                        {data.products.length.toLocaleString("en-IN")}
                                    </span>{" "}
                                    {data.products.length === 1 ? "product" : "products"}
                                </p>
                            </div>
                        </>
                    )}
                </section>
            )}
        </div>
    );
}

export default ProductReportPage;