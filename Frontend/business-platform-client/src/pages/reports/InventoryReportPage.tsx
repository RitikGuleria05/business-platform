import { useState } from "react";
import { useInventoryReport } from "../../hooks/reports/useInventoryReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function InventoryReportPage() {
    const { data, loading, error, refetch } = useInventoryReport();

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStockStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "in stock":
                return "bg-green-100 text-green-700";

            case "low stock":
                return "bg-yellow-100 text-yellow-700";

            case "out of stock":
                return "bg-red-100 text-red-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

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
            window.URL.revokeObjectURL(url);
        } catch {
            setExportError("Failed to export inventory report.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Loading inventory report...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={refetch}
                        className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    No inventory data available.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Inventory Report
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Overview of current inventory levels and stock value.
                </p>

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

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Products
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {data.totalProducts}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        In Stock
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {data.inStockProducts}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Low Stock
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {data.lowStockProducts}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Out of Stock
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {data.outOfStockProducts}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Stock Value
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCurrency(data.totalStockValue)}
                    </p>
                </div>

            </div>

            {/* Product Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Inventory Details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Current stock levels and inventory valuation by product.
                    </p>
                </div>

                {data.products.length === 0 ? (
                    <div className="p-6">
                        <p className="text-sm text-slate-500">
                            No inventory data available.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-300 text-left">

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
                                        Reorder Level
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Min Stock
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Max Stock
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Cost Price
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Selling Price
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Stock Value
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Status
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {data.products.map((product) => (
                                    <tr
                                        key={product.productId}
                                        className="
                                            border-b
                                            border-slate-100
                                            last:border-0
                                        "
                                    >

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

                                        {/* Reorder Level */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {product.reorderLevel}
                                        </td>

                                        {/* Minimum Stock */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {product.minimumStock}
                                        </td>

                                        {/* Maximum Stock */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {product.maximumStock}
                                        </td>

                                        {/* Cost Price */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatCurrency(
                                                product.costPrice
                                            )}
                                        </td>

                                        {/* Selling Price */}
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatCurrency(
                                                product.sellingPrice
                                            )}
                                        </td>

                                        {/* Stock Value */}
                                        <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                            {formatCurrency(
                                                product.stockValue
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`
                                                    inline-flex
                                                    rounded-full
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    ${getStockStatusClass(
                                                    product.stockStatus
                                                )}
                                                `}
                                            >
                                                {product.stockStatus}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default InventoryReportPage;