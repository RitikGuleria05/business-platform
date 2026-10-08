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
    onReturn: (sale: SaleResponse) => void; // NEW
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
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                    Loading sales...
                </p>
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-700">
                    No sales found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    Create your first sale to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Invoice
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Customer
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Date
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Payment
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {sales.map((sale) => (
                            <tr
                                key={sale.id}
                                className="transition hover:bg-slate-50"
                            >
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                    {sale.invoiceNumber}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                                    {sale.customerName}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    {new Date(
                                        sale.saleDate
                                    ).toLocaleDateString()}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                    ₹{sale.grandTotal.toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                        {getPaymentStatusLabel(
                                            sale.paymentStatus
                                        )}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sale.status === 1
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
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
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>

                                        {/* Return */}
                                        {sale.status !== SaleStatus.Cancelled && (
                                            <button
                                                type="button"
                                                onClick={() => onReturn(sale)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                                            >
                                                Return
                                            </button>
                                        )}

                                        {/* Cancel */}
                                        {sale.status !== SaleStatus.Cancelled &&
                                            onCancel && (
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel(sale.id)}
                                                    className="..."
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