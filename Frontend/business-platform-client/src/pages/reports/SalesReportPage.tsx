import { useState } from "react";
import { useSalesReport } from "../../hooks/dashboard/useSalesReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function SalesReportPage() {
    const today = new Date();
    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const [from, setFrom] = useState(formatDate(firstDayOfMonth));
    const [to, setTo] = useState(formatDate(today));

    const [appliedFrom, setAppliedFrom] = useState(from);
    const [appliedTo, setAppliedTo] = useState(to);

    const { data, loading, error, refetch } = useSalesReport(appliedFrom, appliedTo);

    const [filterError, setFilterError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

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
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    const handleExport = async () => {
        if (!appliedFrom || !appliedTo) {
            return;
        }

        try {
            setExporting(true);
            setExportError(null);

            const blob = await reportExportApi.sales(
                appliedFrom,
                appliedTo
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `sales-report-${appliedFrom}-to-${appliedTo}.xlsx`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setExportError("Failed to export sales report.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Sales Report
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Analyze sales performance for a selected period.
                </p>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* From */}
                    <div>
                        <label htmlFor="from" className="mb-2 block text-sm font-medium text-slate-700" > From </label>
                        <input id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className=" w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 " />
                    </div> {/* To */}
                    <div>
                        <label htmlFor="to" className="mb-2 block text-sm font-medium text-slate-700" > To </label>
                        <input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} className=" w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 " />
                    </div>
                    {/* Actions */}
                    <div className="flex items-end gap-3">
                        <button type="button" onClick={handleApply} className=" flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 " > Apply </button>
                        <div className="flex flex-col items-start">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={exporting}
                                className=" rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                                {exporting ? "Exporting..." : "Export Excel"}
                            </button>

                            {exportError && (
                                <p className="mt-2 text-sm text-red-600">
                                    {exportError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">
                        Loading sales report...
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
                        className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Report */}
            {!loading && !error && data && (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Gross Sales
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatCurrency(data.grossSales)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Returns
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatCurrency(data.totalReturns)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Net Sales
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatCurrency(data.netSales)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Total Orders
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {data.totalOrders}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Average Order
                            </p>

                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatCurrency(data.averageOrderValue)}
                            </p>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Sales Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Sales transactions from{" "}
                                {formatDateTime(appliedFrom)} to{" "}
                                {formatDateTime(appliedTo)}.
                            </p>
                        </div>

                        {data.sales.length === 0 ? (
                            <div className="p-6">
                                <p className="text-sm text-slate-500">
                                    No sales found for the selected period.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-250 text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Invoice
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Customer
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Subtotal
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Discount
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Tax
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Total
                                            </th>

                                            <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                                Payment
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.sales.map((sale) => (
                                            <tr
                                                key={sale.saleId}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                    {sale.invoiceNumber}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDateTime(
                                                        sale.saleDate
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {sale.customerName || "Walk-in Customer"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatCurrency(
                                                        sale.subTotal
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatCurrency(
                                                        sale.discount
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatCurrency(
                                                        sale.tax
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                    {formatCurrency(
                                                        sale.grandTotal
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                        {sale.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default SalesReportPage;