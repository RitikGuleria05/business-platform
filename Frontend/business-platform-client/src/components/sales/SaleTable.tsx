import { Eye } from "lucide-react";
import {
    type SaleResponse,
    SaleStatus,
    type PaymentStatus,
} from "../../types/Sales/sale.types";

interface SaleTableProps {
    sales: SaleResponse[];
    loading: boolean;
    onView: (id: string) => void;
    onCancel?: (id: string) => void;
    onReturn: (sale: SaleResponse) => void;
}

const getPaymentStatusLabel = (status: PaymentStatus) => {
    switch (status) {
        case 2:
            return "Paid";
        case 3:
            return "Partially Paid";
        case 1:
            return "Pending";
        case 4:
            return "Cancelled";
        case 5:
            return "Refunded";
        default:
            return "Unknown";
    }
};

const getSaleStatusLabel = (status: SaleStatus) => {
    switch (status) {
        case 1:
            return "Completed";
        case 2:
            return "Cancelled";
        default:
            return "Unknown";
    }
};

export default function SaleTable({
    sales,
    loading,
    onView,
    onCancel,
    onReturn,
}: SaleTableProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading sales...
                </p>
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    No sales found
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Create your first sale to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Invoice
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Customer
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Date
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Total
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Payment
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Status
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sales.map((sale) => (
                            <tr
                                key={sale.id}
                                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {sale.invoiceNumber}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                                    {sale.customerName}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(
                                        sale.saleDate
                                    ).toLocaleDateString()}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    ₹{sale.grandTotal.toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                        {getPaymentStatusLabel(
                                            sale.paymentStatus
                                        )}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                            sale.status === 1
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                        }`}
                                    >
                                        {getSaleStatusLabel(sale.status)}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        {/* View */}
                                        <button
                                            type="button"
                                            onClick={() => onView(sale.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>

                                        {/* Return */}
                                        {sale.status !== SaleStatus.Cancelled && (
                                            <button
                                                type="button"
                                                onClick={() => onReturn(sale)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-transparent px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/60 dark:hover:text-amber-200"
                                            >
                                                Return
                                            </button>
                                        )}

                                        {/* Cancel */}
                                        {sale.status !== SaleStatus.Cancelled &&
                                            onCancel && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onCancel(sale.id)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-transparent px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/60 dark:hover:text-red-200"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}