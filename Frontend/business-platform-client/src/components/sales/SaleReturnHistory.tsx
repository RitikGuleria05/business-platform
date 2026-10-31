import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useSaleReturns } from "../../hooks/sales/useSaleReturns";
import type { SaleReturnResponse } from "../../types/Sales/sale.types";

interface SaleReturnHistoryProps {
    saleId: string;
}

const getReturnStatusLabel = (status: number) => {
    switch (status) {
        case 1:
            return "Pending";
        case 2:
            return "Completed";
        case 3:
            return "Cancelled";
        default:
            return "Unknown";
    }
};

const getReturnStatusClass = (status: number) => {
    switch (status) {
        case 2:
            return "bg-green-50 text-green-700";
        case 3:
            return "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300";
        case 1:
            return "bg-yellow-50 text-yellow-700";
        default:
            return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
    }
};

export default function SaleReturnHistory({
    saleId,
}: SaleReturnHistoryProps) {
    const {
        returns,
        loading,
        error,
        fetchReturnsBySaleId,
    } = useSaleReturns();

    useEffect(() => {
        fetchReturnsBySaleId(saleId);
    }, [saleId, fetchReturnsBySaleId]);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2">
                    <RotateCcw size={20} />

                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                            Return History
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Returns made against this sale
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                    Loading return history...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="p-6 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && returns.length === 0 && (
                <div className="p-8 text-center">
                    <RotateCcw
                        size={32}
                        className="mx-auto mb-3 text-slate-400 dark:text-slate-500"
                    />

                    <p className="font-medium text-slate-700 dark:text-slate-200 dark:text-slate-300">
                        No returns yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        No products have been returned from this sale.
                    </p>
                </div>
            )}

            {/* Returns */}
            {!loading && !error && returns.length > 0 && (
                <div className="divide-y divide-gray-200">
                    {returns.map((saleReturn: SaleReturnResponse) => (
                        <div
                            key={saleReturn.id}
                            className="p-5"
                        >
                            {/* Return Header */}
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                            {saleReturn.returnNumber}
                                        </h3>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getReturnStatusClass(
                                                saleReturn.status
                                            )}`}
                                        >
                                            {getReturnStatusLabel(
                                                saleReturn.status
                                            )}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(
                                            saleReturn.returnDate
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-left md:text-right">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Return Amount
                                    </p>

                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        ₹
                                        {saleReturn.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            {saleReturn.reason && (
                                <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Reason
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 dark:text-slate-300">
                                        {saleReturn.reason}
                                    </p>
                                </div>
                            )}

                            {/* Items */}
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
                                            <th className="px-3 py-3 font-medium">
                                                Product
                                            </th>

                                            <th className="px-3 py-3 font-medium">
                                                Quantity
                                            </th>

                                            <th className="px-3 py-3 text-right font-medium">
                                                Unit Price
                                            </th>

                                            <th className="px-3 py-3 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {saleReturn.items.map((item) => (
                                            <tr
                                                key={`${saleReturn.id}-${item.productId}`}
                                                className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                                            >
                                                <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                    {item.productName}
                                                </td>

                                                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                                                    {item.quantity}
                                                </td>

                                                <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-300">
                                                    ₹
                                                    {item.unitPrice.toFixed(2)}
                                                </td>

                                                <td className="px-3 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                                                    ₹
                                                    {item.total.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
