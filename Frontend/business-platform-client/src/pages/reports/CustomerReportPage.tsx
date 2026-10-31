import { useState } from "react";
import {
    CalendarDays,
    Download,
    FileSpreadsheet,
    RefreshCw,
    Users,
    TrendingUp,
    RotateCcw,
    Wallet,
} from "lucide-react";

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

    const [from, setFrom] = useState(formatDate(firstDayOfMonth));
    const [to, setTo] = useState(formatDate(today));

    const [appliedFrom, setAppliedFrom] = useState(from);
    const [appliedTo, setAppliedTo] = useState(to);

    const { data, loading, error, refetch } = useCustomerReport(appliedFrom,appliedTo);

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

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDateTime = (value: string) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleExport = async () => {
        if (!appliedFrom || !appliedTo) return;

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
            <div className="flex min-h-64 items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Loading customer report...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={refetch}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 sm:p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        No customer data available.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 space-y-6 p-4 sm:p-6">
            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Customer Report
                    </h1>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Analyze customer purchases and returns for a selected
                        period.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950 sm:w-auto"
                >
                    {exporting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {exporting ? "Exporting..." : "Export Excel"}
                </button>
            </header>

            {/* Date Filters */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Report Period
                    </h2>
                </div>

                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                        <label
                            htmlFor="from"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            From date
                        </label>

                        <input
                            id="from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
                        />
                    </div>

                    <div className="min-w-0">
                        <label
                            htmlFor="to"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            To date
                        </label>

                        <input
                            id="to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                            className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleApply}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 lg:w-auto"
                    >
                        <CalendarDays className="h-4 w-4" />
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

                {exportError && (
                    <p
                        role="alert"
                        className="mt-3 text-sm text-red-600 dark:text-red-400"
                    >
                        {exportError}
                    </p>
                )}
            </section>

            {/* Summary Cards */}
            <section>
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Summary for {formatDateTime(appliedFrom)} to{" "}
                        {formatDateTime(appliedTo)}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<Users className="h-5 w-5" />}
                        label="Total Customers"
                        value={data.totalCustomers.toLocaleString("en-IN")}
                        iconStyle="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    />

                    <SummaryCard
                        icon={<Wallet className="h-5 w-5" />}
                        label="Total Sales"
                        value={formatCurrency(data.totalSales)}
                        iconStyle="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    />

                    <SummaryCard
                        icon={<RotateCcw className="h-5 w-5" />}
                        label="Total Returns"
                        value={formatCurrency(data.totalReturns)}
                        iconStyle="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    />

                    <SummaryCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Net Sales"
                        value={formatCurrency(data.netSales)}
                        iconStyle="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
                    />
                </div>
            </section>

            {/* Customer Details Table */}
            <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-5">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Customer Details
                        </h2>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Customer purchases, returns, and average order values.
                    </p>
                </div>

                {data.customers.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Users className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>

                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            No customer records found
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Try selecting a different report period.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Customer
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Orders
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Gross Sales
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Returns
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Net Sales
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Avg. Order Value
                                    </th>

                                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                        Last Purchase
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.customers.map((customer) => (
                                    <tr
                                        key={customer.customerId}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="block max-w-64 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {customer.customerName}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-700 dark:text-slate-300">
                                            {customer.totalOrders.toLocaleString("en-IN")}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-700 dark:text-slate-300">
                                            {formatCurrency(customer.totalPurchase)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-amber-700 dark:text-amber-300">
                                            {formatCurrency(customer.totalReturns)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                                            {formatCurrency(customer.netPurchase)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-700 dark:text-slate-300">
                                            {formatCurrency(customer.averageOrderValue)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {formatDateTime(customer.lastPurchaseDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data.customers.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:px-5">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Showing{" "}
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {data.customers.length}
                            </span>{" "}
                            customer records
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

interface SummaryCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconStyle: string;
}

function SummaryCard({
    icon,
    label,
    value,
    iconStyle,
}: SummaryCardProps) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                >
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CustomerReportPage;