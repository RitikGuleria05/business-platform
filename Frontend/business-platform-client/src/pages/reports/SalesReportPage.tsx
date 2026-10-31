import { useState } from "react";
import { Download, RefreshCw, ShoppingCart, TrendingUp, Wallet, Receipt, CalendarDays } from "lucide-react";
import { useSalesReport } from "../../hooks/dashboard/useSalesReport";
import { reportExportApi } from "../../services/reports/reportExportService";

function formatInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatCurrency(value: number): string {
    return `₹${(value ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateTime(value: string): string {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function SalesReportPage() {
    const today = new Date();
    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const [from, setFrom] = useState(formatInputDate(firstDayOfMonth));
    const [to, setTo] = useState(formatInputDate(today));

    const [appliedFrom, setAppliedFrom] = useState(
        formatInputDate(firstDayOfMonth)
    );
    const [appliedTo, setAppliedTo] = useState(formatInputDate(today));

    const { data, loading, error, refetch } = useSalesReport(
        appliedFrom,
        appliedTo
    );

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

    const handleExport = async () => {
        if (!appliedFrom || !appliedTo || exporting) {
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

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch {
            setExportError("Failed to export sales report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const summaryCards = data
        ? [
              {
                  label: "Gross Sales",
                  value: formatCurrency(data.grossSales),
                  icon: TrendingUp,
                  iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
              },
              {
                  label: "Returns",
                  value: formatCurrency(data.totalReturns),
                  icon: RefreshCw,
                  iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
              },
              {
                  label: "Net Sales",
                  value: formatCurrency(data.netSales),
                  icon: Wallet,
                  iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
              },
              {
                  label: "Total Orders",
                  value: (data.totalOrders ?? 0).toLocaleString("en-IN"),
                  icon: ShoppingCart,
                  iconClass: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
              },
              {
                  label: "Average Order",
                  value: formatCurrency(data.averageOrderValue),
                  icon: Receipt,
                  iconClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
              },
          ]
        : [];

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400";

    return (
        <div className="min-h-full space-y-6 p-4 sm:p-6">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <TrendingUp size={21} />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            Sales Report
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Analyze sales performance, revenue, and orders for a
                        selected period.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting || loading || !data}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-950"
                >
                    <Download size={16} />
                    {exporting ? "Exporting..." : "Export Excel"}
                </button>
            </div>

            {/* Date filters */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-2">
                    <CalendarDays
                        size={18}
                        className="text-slate-500 dark:text-slate-400"
                    />

                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Report Period
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <div>
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
                            max={to || undefined}
                            onChange={(event) => setFrom(event.target.value)}
                            className={inputClassName}
                        />
                    </div>

                    <div>
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
                            min={from || undefined}
                            max={formatInputDate(today)}
                            onChange={(event) => setTo(event.target.value)}
                            className={inputClassName}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-slate-900"
                    >
                        <RefreshCw size={16} />
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

            {/* Loading state */}
            {loading && (
                <div
                    role="status"
                    className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Loading sales report...
                        </p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30"
                >
                    <h2 className="font-semibold text-red-800 dark:text-red-300">
                        Unable to load sales report
                    </h2>

                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={refetch}
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Report content */}
            {!loading && !error && data && (
                <>
                    {/* Summary cards */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Sales Overview
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Summary for {formatDateTime(appliedFrom)} to{" "}
                                {formatDateTime(appliedTo)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                            {summaryCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.label}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                    {card.label}
                                                </p>

                                                <p className="mt-3 break-words text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                                    {card.value}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
                                            >
                                                <Icon size={19} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Sales details table */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-800">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Sales Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Transaction records for the selected period.
                            </p>
                        </div>

                        {data.sales.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <ShoppingCart
                                        size={22}
                                        className="text-slate-500 dark:text-slate-400"
                                    />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    No sales found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                                    There are no sales transactions for the
                                    selected period. Try choosing different
                                    dates.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                                        <tr>
                                            {[
                                                "Invoice",
                                                "Date",
                                                "Customer",
                                                "Subtotal",
                                                "Discount",
                                                "Tax",
                                                "Total",
                                                "Payment",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    scope="col"
                                                    className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                                                        [
                                                            "Subtotal",
                                                            "Discount",
                                                            "Tax",
                                                            "Total",
                                                        ].includes(heading)
                                                            ? "text-right"
                                                            : ""
                                                    }`}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.sales.map((sale) => (
                                            <tr
                                                key={sale.saleId}
                                                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {sale.invoiceNumber}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {formatDateTime(sale.saleDate)}
                                                </td>

                                                <td className="max-w-56 truncate px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {sale.customerName ||
                                                        "Walk-in Customer"}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300">
                                                    {formatCurrency(sale.subTotal)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300">
                                                    {formatCurrency(sale.discount)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300">
                                                    {formatCurrency(sale.tax)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(sale.grandTotal)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        {sale.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {data.sales.length > 0 && (
                            <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing {data.sales.length}{" "}
                                    {data.sales.length === 1
                                        ? "transaction"
                                        : "transactions"}
                                </p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default SalesReportPage;