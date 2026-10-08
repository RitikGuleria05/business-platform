import { useState } from "react";
import { useCustomerReport } from "../../hooks/reports/useCustomerReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function CustomerReportPage() {

    const [filterError, setFilterError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const today = new Date();

    const formatDate = (date: Date) => {
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

    const [from, setFrom] = useState(
        formatDate(firstDayOfMonth)
    );

    const [to, setTo] = useState(
        formatDate(today)
    );

    const [appliedFrom, setAppliedFrom] = useState(from);
    const [appliedTo, setAppliedTo] = useState(to);

    const { data, loading, error, refetch } = useCustomerReport(appliedFrom, appliedTo);

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


    const handleExport = async () => {
        if (!appliedFrom || !appliedTo) {
            return;
        }

        try {
            setExporting(true);
            setExportError(null);

            const blob = await reportExportApi.customers(
                appliedFrom,
                appliedTo
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `customer-report-${appliedFrom}-to-${appliedTo}.xlsx`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setExportError("Failed to export customer report.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Loading customer report...
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
                        className="
                            mt-3
                            rounded-lg
                            bg-slate-900
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-slate-800
                        "
                    >
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
                    No customer data available.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Customer Report
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Analyze customer sales and returns for a selected period.
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
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
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

                    <div className="flex items-end gap-2">
                        <button type="button"
                            onClick={handleApply}
                            className=" flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                            Apply
                        </button>

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

                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Customers
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {data.totalCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Sales
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCurrency(data.totalSales)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Returns
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCurrency(data.totalReturns)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Net Sales
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCurrency(data.netSales)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Report Period
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                        {formatDateTime(appliedFrom)}
                    </p>

                    <p className="text-sm text-slate-500">
                        to {formatDateTime(appliedTo)}
                    </p>
                </div>

            </div>

            {/* Customer Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-4">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Customer Details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Customer sales and return performance for the selected period.
                    </p>

                </div>

                {data.customers.length === 0 ? (
                    <div className="p-6">
                        <p className="text-sm text-slate-500">
                            No customer data found for the selected period.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-275 text-left">

                            <thead>
                                <tr className="border-b border-slate-200">

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Phone
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Email
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Orders
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Gross Sales
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Returns
                                    </th>

                                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                                        Net Sales
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {data.customers.map((customer) => (
                                    <tr key={customer.customerId}>
                                        <td>{customer.customerName}</td>

                                        <td>{customer.totalOrders}</td>

                                        <td>{formatCurrency(customer.totalPurchase)}</td>

                                        <td>{formatCurrency(customer.totalReturns)}</td>

                                        <td>{formatCurrency(customer.netPurchase)}</td>

                                        <td>{formatCurrency(customer.averageOrderValue)}</td>

                                        <td>
                                            {new Date(customer.lastPurchaseDate).toLocaleDateString("en-IN")}
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

export default CustomerReportPage;