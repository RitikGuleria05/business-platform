import { CreditCard, Plus, Trash2 } from "lucide-react";
import {PaymentMethod,type PaymentRequest} from "../../types/Sales/sale.types";

interface PaymentSectionProps {
    payments: PaymentRequest[];
    onChange: (payments: PaymentRequest[]) => void;
    grandTotal: number;
}

export default function PaymentSection({
    payments,
    onChange,
    grandTotal,
}: PaymentSectionProps) {
    const addPayment = () => {
        const totalPaid = payments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        onChange([
            ...payments,
            {
                amount: Math.max(0, grandTotal - totalPaid),
                method: PaymentMethod.Cash,
                transactionReference: null,
            },
        ]);
    };

    const updatePayment = (
        index: number,
        field: keyof PaymentRequest,
        value: number | string | null
    ) => {
        const updated = [...payments];

        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        onChange(updated);
    };

    const removePayment = (index: number) => {
        onChange(payments.filter((_, i) => i !== index));
    };

    const totalPaid = payments.reduce(
        (total, payment) => total + payment.amount,
        0
    );

    const remaining = Math.max(0, grandTotal - totalPaid);

    return (
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <CreditCard className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Payments
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Add one or more payment methods
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={addPayment}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Payment
                </button>
            </div>

            {/* Payments */}
            <div className="p-5">
                {payments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/60">
                        <CreditCard className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />

                        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                            No payments added
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Add a payment method to complete this sale.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-end">
                                    {/* Amount */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Amount
                                        </label>

                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={payment.amount}
                                                onChange={(e) =>
                                                    updatePayment(
                                                        index,
                                                        "amount",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-8 pr-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Method */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Method
                                        </label>

                                        <select
                                            value={payment.method}
                                            onChange={(e) =>
                                                updatePayment(
                                                    index,
                                                    "method",
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value={PaymentMethod.Cash}>
                                                Cash
                                            </option>

                                            <option value={PaymentMethod.Card}>
                                                Card
                                            </option>

                                            <option value={PaymentMethod.UPI}>
                                                UPI
                                            </option>

                                            <option
                                                value={
                                                    PaymentMethod.BankTransfer
                                                }
                                            >
                                                Bank Transfer
                                            </option>
                                        </select>
                                    </div>

                                    {/* Transaction reference */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Transaction Reference
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Optional reference"
                                            value={
                                                payment.transactionReference ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                updatePayment(
                                                    index,
                                                    "transactionReference",
                                                    e.target.value || null
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removePayment(index)}
                                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 px-3 text-xs font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Payment Summary */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Paid</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            ₹{totalPaid.toFixed(2)}
                        </p>
                    </div>

                    <div
                        className={`rounded-lg px-4 py-3 ${
                            remaining > 0
                                ? "bg-amber-50 dark:bg-amber-950/40"
                                : "bg-emerald-50 dark:bg-emerald-950/40"
                        }`}
                    >
                        <p
                            className={`text-xs ${
                                remaining > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                            }`}
                        >
                            Remaining
                        </p>

                        <p
                            className={`mt-1 text-lg font-semibold ${
                                remaining > 0
                                    ? "text-amber-700 dark:text-amber-300"
                                    : "text-emerald-700 dark:text-emerald-300"
                            }`}
                        >
                            ₹{remaining.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
