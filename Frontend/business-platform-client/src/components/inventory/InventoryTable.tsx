
import {
    PackageMinus,
    PackagePlus,
    Settings,
} from "lucide-react";

import type { Inventory } from "../../types/Inventory/inventory.types";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface InventoryTableProps {
    inventory: Inventory[];
    loading: boolean;
    canIncrease: boolean;
    canDecrease: boolean;
    canAdjust: boolean;
    canSettings: boolean;
    onIncrease: (item: Inventory) => void;
    onDecrease: (item: Inventory) => void;
    onAdjust: (item: Inventory) => void;
    onSettings: (item: Inventory) => void;
}

function InventoryTable({
    inventory,
    loading,
    canIncrease,
    canDecrease,
    canAdjust,
    canSettings,
    onIncrease,
    onDecrease,
    onAdjust,
    onSettings,
}: InventoryTableProps) {
    const getStatus = (item: Inventory) => {
        if (item.quantityInStock === 0) {
            return {
                label: "Out of Stock",
                variant: "danger" as const,
            };
        }

        if (item.quantityInStock <= item.reorderLevel) {
            return {
                label: "Low Stock",
                variant: "warning" as const,
            };
        }

        return {
            label: "In Stock",
            variant: "success" as const,
        };
    };

    if (loading) {
        return (
            <div className="space-y-4 p-5" aria-label="Loading inventory">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex animate-pulse items-center gap-4"
                    >
                        <div className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                ))}
            </div>
        );
    }

    if (inventory.length === 0) {
        return (
            <div className="flex flex-col items-center px-5 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <PackagePlus className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    No inventory found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    There are no inventory records matching this view.
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/40">
                        <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Product
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            SKU
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Current stock
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Stock limits
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Status
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inventory.map((item) => {
                        const status = getStatus(item);

                        return (
                            <tr
                                key={item.productId}
                                className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            >
                                <td className="px-5 py-4">
                                    <p className="max-w-[240px] truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {item.productName}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                        {item.sku}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                                        {item.quantityInStock}
                                    </span>
                                    <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        units
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                        <p>
                                            <span className="text-slate-400 dark:text-slate-500">Min</span>
                                            <span className="ml-2 tabular-nums">{item.minimumStock}</span>
                                        </p>
                                        <p>
                                            <span className="text-slate-400 dark:text-slate-500">Max</span>
                                            <span className="ml-2 tabular-nums">{item.maximumStock}</span>
                                        </p>
                                        <p>
                                            <span className="text-slate-400 dark:text-slate-500">Reorder</span>
                                            <span className="ml-2 tabular-nums">{item.reorderLevel}</span>
                                        </p>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {canIncrease && (
                                            <Button
                                                type="button"
                                                onClick={() => onIncrease(item)}
                                                className="!min-h-9 !px-3 !py-2 !bg-emerald-600 !text-white hover:!bg-emerald-700"
                                            >
                                                <PackagePlus className="h-4 w-4 shrink-0" />
                                                <span>Add</span>
                                            </Button>
                                        )}

                                        {canDecrease && (
                                            <Button
                                                type="button"
                                                onClick={() => onDecrease(item)}
                                                className="!min-h-9 !px-3 !py-2 !bg-orange-600 !text-white hover:!bg-orange-700"
                                            >
                                                <PackageMinus className="h-4 w-4 shrink-0" />
                                                <span>Remove</span>
                                            </Button>
                                        )}

                                        {canAdjust && (
                                            <Button
                                                type="button"
                                                onClick={() => onAdjust(item)}
                                                className="!min-h-9 !px-3 !py-2 !bg-white !text-slate-700 !border !border-slate-300 hover:!bg-slate-50 dark:!bg-slate-900 dark:!text-slate-200 dark:!border-slate-700 dark:hover:!bg-slate-800"
                                            >
                                                Adjust
                                            </Button>
                                        )}

                                        {canSettings && (
                                            <Button
                                                type="button"
                                                onClick={() => onSettings(item)}
                                                aria-label={`Settings for ${item.productName}`}
                                                title="Stock settings"
                                                className="!min-h-9 !w-9 !shrink-0 !px-0 !py-0 !bg-white !text-slate-600 !border !border-slate-300 hover:!bg-slate-50 hover:!text-indigo-600 dark:!bg-slate-900 dark:!text-slate-300 dark:!border-slate-700 dark:hover:!bg-slate-800 dark:hover:!text-indigo-400"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default InventoryTable;
