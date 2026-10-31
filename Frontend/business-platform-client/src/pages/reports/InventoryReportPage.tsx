import { useState } from "react";
import { useInventoryReport } from "../../hooks/reports/useInventoryReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function InventoryReportPage() {
    const { data, loading, error, refetch } = useInventoryReport();

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStockStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "in stock":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
            case "low stock":
                return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
            case "out of stock":
                return "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
            default:
                return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            setExportError(null);

            const blob = await reportExportApi.inventory();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "inventory-report.xlsx";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch {
            setExportError("Failed to export inventory report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Loading inventory report...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
                    <h2 className="text-base font-semibold text-red-800 dark:text-red-300">
                        Unable to load inventory report
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
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 sm:p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        No inventory data available.
                    </p>
                </div>
            </div>
        );
    }

    const summaryCards = [
        {
            label: "Total Products",
            value: data.totalProducts.toLocaleString("en-IN"),
            accent: "border-l-blue-500",
        },
        {
            label: "In Stock",
            value: data.inStockProducts.toLocaleString("en-IN"),
            accent: "border-l-emerald-500",
        },
        {
            label: "Low Stock",
            value: data.lowStockProducts.toLocaleString("en-IN"),
            accent: "border-l-amber-500",
        },
        {
            label: "Out of Stock",
            value: data.outOfStockProducts.toLocaleString("en-IN"),
            accent: "border-l-red-500",
        },
        {
            label: "Total Stock Value",
            value: formatCurrency(data.totalStockValue),
            accent: "border-l-violet-500",
        },
    ];

    const cellClass =
        "whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300";

    const headerClass =
        "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

    return (
        <div className="min-h-full space-y-6 p-4 text-slate-900 dark:text-slate-100 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        Inventory Report
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        Overview of current inventory levels, stock availability,
                        and product valuation.
                    </p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
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

            {/* Summary Cards */}
            <section
                aria-label="Inventory summary"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
            >
                {summaryCards.map((card) => (
                    <div
                        key={card.label}
                        className={`min-w-0 rounded-xl border border-slate-200 border-l-4 ${card.accent} bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900`}
                    >
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {card.label}
                        </p>
                        <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            {card.value}
                        </p>
                    </div>
                ))}
            </section>

            {/* Inventory Details */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Inventory Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Current stock levels, pricing, and inventory valuation
                        by product.
                    </p>
                </div>

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
                            No products found
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                            Inventory details will appear here when products
                            are available.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/70">
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th scope="col" className={headerClass}>Product</th>
                                    <th scope="col" className={headerClass}>SKU</th>
                                    <th scope="col" className={headerClass}>Category</th>
                                    <th scope="col" className={headerClass}>Stock</th>
                                    <th scope="col" className={headerClass}>Reorder Level</th>
                                    <th scope="col" className={headerClass}>Min Stock</th>
                                    <th scope="col" className={headerClass}>Max Stock</th>
                                    <th scope="col" className={headerClass}>Cost Price</th>
                                    <th scope="col" className={headerClass}>Selling Price</th>
                                    <th scope="col" className={headerClass}>Stock Value</th>
                                    <th scope="col" className={headerClass}>Status</th>
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
                                        <td className={cellClass}>{product.sku || "—"}</td>
                                        <td className={cellClass}>{product.categoryName || "—"}</td>
                                        <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {product.currentStock.toLocaleString("en-IN")}
                                        </td>
                                        <td className={cellClass}>
                                            {product.reorderLevel.toLocaleString("en-IN")}
                                        </td>
                                        <td className={cellClass}>
                                            {product.minimumStock.toLocaleString("en-IN")}
                                        </td>
                                        <td className={cellClass}>
                                            {product.maximumStock.toLocaleString("en-IN")}
                                        </td>
                                        <td className={cellClass}>{formatCurrency(product.costPrice)}</td>
                                        <td className={cellClass}>{formatCurrency(product.sellingPrice)}</td>
                                        <td className="whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(product.stockValue)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3.5">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStockStatusClass(product.stockStatus)}`}
                                            >
                                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                                                {product.stockStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data.products.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40 sm:px-6">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Showing{" "}
                            <span className="text-slate-900 dark:text-slate-200">
                                {data.products.length.toLocaleString("en-IN")}
                            </span>{" "}
                            {data.products.length === 1 ? "product" : "products"}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default InventoryReportPage;