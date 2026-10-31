import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
    CreateSaleReturnRequest,
    SaleResponse,
    SaleReturnResponse,
} from "../../types/Sales/sale.types";

import { useSaleReturns } from "../../hooks/sales/useSaleReturns";

interface SaleReturnFormProps {
    sale: SaleResponse;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ReturnItem {
    productId: string;
    productName: string;
    soldQuantity: number;
    alreadyReturned: number;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function SaleReturnForm({
    sale,
    onSuccess,
    onCancel,
}: SaleReturnFormProps) {
    const {
        addReturn,
        fetchReturnsBySaleId,
        loading,
        error,
    } = useSaleReturns();

    const [reason, setReason] = useState("");
    const [existingReturns, setExistingReturns] = useState<SaleReturnResponse[]>([]);

    const [items, setItems] = useState<ReturnItem[]>([]);

    useEffect(() => {
        const loadReturns = async () => {
            try {
                const data =
                    await fetchReturnsBySaleId(sale.id);

                setExistingReturns(data);
            } catch {
                // Error is already handled by the hook.
            }
        };

        loadReturns();
    }, [sale.id, fetchReturnsBySaleId]);

    useEffect(() => {
        const returnedQuantities = new Map<string, number>();

        existingReturns.forEach((saleReturn) => {
            saleReturn.items.forEach((item) => {
                const current =
                    returnedQuantities.get(item.productId) ?? 0;

                returnedQuantities.set(
                    item.productId,
                    current + item.quantity
                );
            });
        });

        const initialItems = sale.items.map((item) => {
            const alreadyReturned = returnedQuantities.get(item.productId) ?? 0;

            const remaining = item.quantity - alreadyReturned;

            return {
                productId: item.productId,
                productName: item.productName,
                soldQuantity: item.quantity,
                alreadyReturned,
                quantity: 0,
                unitPrice: item.unitPrice,
                total: 0,
            };
        });

        setItems(initialItems);
    }, [sale.items, existingReturns]);

    const updateQuantity = (productId: string, quantity: number) => {
        setItems((previous) =>
            previous.map((item) => {
                if (item.productId !== productId) {
                    return item;
                }

                const remaining = item.soldQuantity - item.alreadyReturned;

                const safeQuantity = Math.min(Math.max(quantity, 0), remaining);

                return {
                    ...item,
                    quantity: safeQuantity,
                    total:
                        safeQuantity *
                        item.unitPrice,
                };
            })
        );
    };

    const selectedItems = useMemo(() => items.filter((item) => item.quantity > 0), [items]);

    const totalAmount = useMemo(() =>
        selectedItems.reduce(
            (sum, item) => sum + item.total,
            0
        ),
        [selectedItems]
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (selectedItems.length === 0) {
            return;
        }

        const request: CreateSaleReturnRequest = {
            saleId: sale.id,
            reason: reason.trim() || null,
            items: selectedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        };

        await addReturn(request);

        onSuccess();
    };

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Create Sale Return
                    </h1>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Invoice: {sale.invoiceNumber}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Products */}

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="border-b border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-center gap-2">
                            <RotateCcw size={20} />

                            <h2 className="font-semibold">
                                Return Items
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-slate-50 dark:bg-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-3">
                                        Product
                                    </th>

                                    <th className="px-5 py-3">
                                        Sold
                                    </th>

                                    <th className="px-5 py-3">
                                        Already Returned
                                    </th>

                                    <th className="px-5 py-3">
                                        Return Qty
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    return (
                                        <tr
                                            key={item.productId}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                    {item.productName}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                {item.soldQuantity}
                                            </td>

                                            <td className="px-5 py-4">
                                                {item.alreadyReturned}
                                            </td>

                                            <td className="px-5 py-4">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={
                                                        item.soldQuantity -
                                                        item.alreadyReturned
                                                    }
                                                    value={item.quantity}
                                                    disabled={
                                                        item.soldQuantity -
                                                        item.alreadyReturned <=
                                                        0
                                                    }
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            item.productId,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2"
                                                />
                                            </td>

                                            <td className="px-5 py-4 text-right font-medium">
                                                ₹{item.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reason */}

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200 dark:text-slate-300">
                        Reason
                    </label>

                    <textarea
                        value={reason}
                        onChange={(e) =>
                            setReason(e.target.value)
                        }
                        rows={4}
                        placeholder="Enter return reason..."
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 outline-none focus:border-gray-500"
                    />
                </div>

                {/* Summary */}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Return Amount
                        </p>

                        <p className="text-2xl font-semibold">
                            ₹{totalAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                selectedItems.length === 0
                            }
                            className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Processing..."
                                : "Create Return"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
