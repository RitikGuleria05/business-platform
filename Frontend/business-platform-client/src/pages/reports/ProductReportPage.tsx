import { useState } from "react";
import { useProductReport } from "../../hooks/reports/useProductReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function ProductReportPage() {
    const today = new Date();

    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const [from, setFrom] = useState(
        formatDate(firstDayOfMonth)
    );

    const [to, setTo] = useState(
        formatDate(today)
    );

    const [appliedFrom, setAppliedFrom] = useState(from);
    const [appliedTo, setAppliedTo] = useState(to);

    const {
        data,
        loading,
        error,
        refetch,
    } = useProductReport(
        appliedFrom,
        appliedTo
    );

    const [filterError, setFilterError] = useState<string | null>(null);

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

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDateTime = (value: string) => {
        return new Date(value).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExport = async () => {
        if (!appliedFrom || !appliedTo) {
            return;
        }

        try {
            setExporting(true);

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
            window.URL.revokeObjectURL(url);
        } catch {
            setExportError("Failed to export product report.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Product Report
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Analyze product sales, returns, and revenue
                    for a selected period.
                </p>
            </div>

            {/* Date Filter */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div>
                        <label
                            htmlFor="from"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            From
                        </label>

                        <input
                            id="from"
                            type="date"
                            value={from}
                            onChange={(event) =>
                                setFrom(event.target.value)
                            }
                            className=" w-full  rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                    </div>

                    <div>
                        <label
                            htmlFor="to"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            To
                        </label>

                        <input
                            id="to"
                            type="date"
                            value={to}
                            onChange={(event) =>
                                setTo(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                            Apply
                        </button>
                    </div>

                    {filterError && (
                        <p className="mt-3 text-sm text-red-600">
                            {filterError}
                        </p>
                    )}

                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">
                        Loading product report...
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={refetch}
                        className="
                            mt-3
                            rounded-lg
                            bg-slate-900
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                        "
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Report */}
            {!loading && !error && data && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* Report Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Product Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Product performance from{" "}
                                {formatDateTime(appliedFrom)}
                                {" "}to{" "}
                                {formatDateTime(appliedTo)}.
                            </p>
                        </div>

                        <div className="flex flex-col items-start">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={exporting}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                                {exporting ? "Exporting..." : "Export Excel"}
                            </button>

                            {exportError && (
                                <p className="mt-2 text-sm text-red-600">
                                    {exportError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    {data.products.length === 0 ? (
                        <div className="p-6">
                            <p className="text-sm text-slate-500">
                                No product data found for the
                                selected period.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-350 text-left">

                                <thead>
                                    <tr className="border-b border-slate-200">

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Product
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            SKU
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Stock
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Sold
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Gross Revenue
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Returned
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Return Amount
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Net Sold
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                            Net Revenue
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {data.products.map((product) => (
                                        <tr
                                            key={product.productId}
                                            className="border-b border-slate-100 last:border-0">
                                            {/* Product */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {product.productName}
                                                </p>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.sku}
                                            </td>

                                            {/* Category */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.categoryName}
                                            </td>

                                            {/* Current Stock */}
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {product.currentStock}
                                            </td>

                                            {/* Quantity Sold */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.quantitySold}
                                            </td>

                                            {/* Gross Revenue */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatCurrency(
                                                    product.grossRevenue
                                                )}
                                            </td>

                                            {/* Quantity Returned */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {product.quantityReturned}
                                            </td>

                                            {/* Return Amount */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatCurrency(
                                                    product.returnAmount
                                                )}
                                            </td>

                                            {/* Net Quantity */}
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {product.netQuantitySold}
                                            </td>

                                            {/* Net Revenue */}
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                                {formatCurrency(
                                                    product.netRevenue
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default ProductReportPage;