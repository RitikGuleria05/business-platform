import { ArrowLeft, Calendar, CreditCard, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
    PaymentMethod, PaymentStatus, type SaleResponse, SaleStatus,
} from "../../types/Sales/sale.types";
import { useSales } from "../../hooks/sales/useSales";
import SaleReturnHistory from "../../components/sales/SaleReturnHistory";

interface SaleDetailsProps {
    saleId: string;
    onBack: () => void;
    onReturn: (sale: SaleResponse) => void;
}

export default function SaleDetails({
    saleId,
    onBack,
    onReturn,
}: SaleDetailsProps) {
    const { fetchSaleById } = useSales();

    const [sale, setSale] = useState<SaleResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSale = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchSaleById(saleId);
                setSale(data);
            } catch {
                setError("Failed to load sale details.");
            } finally {
                setLoading(false);
            }
        };

        loadSale();
    }, [saleId]);

    if (loading) {
        return (
            <div className="flex min-h-75 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                    <p className="text-sm text-slate-500">
                        Loading sale details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-700">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sales
                </button>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="font-medium text-slate-700">
                    Sale not found.
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sales
                </button>
            </div>
        );
    }

    const isCancelled = sale.status === SaleStatus.Cancelled;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sales
                    </button>

                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Sale Details
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Invoice #{sale.invoiceNumber}
                            </p>
                        </div>

                        {!isCancelled && (
                            <button
                                type="button"
                                onClick={() => onReturn(sale)}
                                className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Return Sale
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sale Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                    icon={<FileText className="h-5 w-5" />}
                    label="Invoice"
                    value={sale.invoiceNumber}
                />

                <InfoCard
                    icon={<User className="h-5 w-5" />}
                    label="Customer"
                    value={sale.customerName}
                />

                <InfoCard
                    icon={<Calendar className="h-5 w-5" />}
                    label="Sale Date"
                    value={new Date(
                        sale.saleDate
                    ).toLocaleString()}
                />

                <InfoCard
                    icon={<CreditCard className="h-5 w-5" />}
                    label="Payment Status"
                    value={getPaymentStatusLabel(
                        sale.paymentStatus
                    )}
                />
            </div>

            {/* Remarks */}
            {sale.remarks && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-900">
                        Remarks
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {sale.remarks}
                    </p>
                </div>
            )}

            {/* Items */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Sale Items
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Products included in this sale.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Product
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Quantity
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Unit Price
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Discount
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Tax
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {sale.items.map((item) => (
                                <tr
                                    key={item.productId}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                        {item.productName}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                                        {item.quantity}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                                        ₹{item.unitPrice.toFixed(2)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                                        ₹{item.discount.toFixed(2)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                                        ₹{item.tax.toFixed(2)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                        ₹{item.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Payments */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">
                        Payments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Payment transactions associated with this sale.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Amount
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Method
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Reference
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Date
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {sale.payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                                        ₹{payment.amount.toFixed(2)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                        {getPaymentMethodLabel(
                                            payment.method
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                            {getPaymentStatusLabel(
                                                payment.status
                                            )}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                        {payment.transactionReference ||
                                            "-"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {new Date(
                                            payment.paymentDate
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <SaleReturnHistory saleId={sale.id} />
            {/* Summary */}
            <div className="flex justify-end">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Sale Summary
                    </h2>

                    <div className="space-y-3 text-sm">
                        <SummaryRow
                            label="Subtotal"
                            value={sale.subTotal}
                        />

                        <SummaryRow
                            label="Discount"
                            value={sale.discount}
                        />

                        <SummaryRow
                            label="Tax"
                            value={sale.tax}
                        />

                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-slate-900">
                                    Grand Total
                                </span>

                                <span className="text-xl font-bold text-indigo-600">
                                    ₹{sale.grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoCard({
    icon,
    label,
    value,
}: InfoCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface SummaryRowProps {
    label: string;
    value: number;
}

function SummaryRow({
    label,
    value,
}: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-500">
                {label}
            </span>

            <span className="font-medium text-slate-900">
                ₹{value.toFixed(2)}
            </span>
        </div>
    );
}

function getPaymentStatusLabel(
    status: PaymentStatus
) {
    switch (status) {
        case PaymentStatus.Paid:
            return "Paid";

        case PaymentStatus.PartiallyPaid:
            return "Partially Paid";

        case PaymentStatus.Pending:
            return "Pending";

        case PaymentStatus.Cancelled:
            return "Cancelled";

        case PaymentStatus.Refunded:
            return "Refunded";

        default:
            return "Unknown";
    }
}

function getPaymentMethodLabel(
    method: PaymentMethod
) {
    switch (method) {
        case PaymentMethod.Cash:
            return "Cash";

        case PaymentMethod.Card:
            return "Card";

        case PaymentMethod.UPI:
            return "UPI";

        case PaymentMethod.BankTransfer:
            return "Bank Transfer";

        default:
            return "Unknown";
    }
}