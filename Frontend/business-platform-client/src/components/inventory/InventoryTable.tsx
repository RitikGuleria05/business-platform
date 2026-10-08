import { PackagePlus, PackageMinus, Settings } from "lucide-react";

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
            <div className="py-12 text-center text-sm text-slate-500">
                Loading inventory...
            </div>
        );
    }

    if (inventory.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                    No inventory found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    Inventory records will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            Product
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            SKU
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            Current Stock
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            Limits
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                            Status
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {inventory.map((item) => {
                        const status = getStatus(item);

                        return (
                            <tr
                                key={item.productId}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="px-4 py-4">
                                    <p className="text-sm font-medium text-slate-900">
                                        {item.productName}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="text-sm text-slate-600">
                                        {item.sku}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {item.quantityInStock}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="text-xs text-slate-500">
                                        <p>
                                            Min: {item.minimumStock}
                                        </p>
                                        <p>
                                            Max: {item.maximumStock}
                                        </p>
                                        <p>
                                            Reorder: {item.reorderLevel}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex justify-end gap-2">
                                        {canIncrease && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onIncrease(item)
                                                }
                                                className="bg-green-600 px-3 py-2 hover:bg-green-700"
                                            >
                                                <PackagePlus className="h-4 w-4" />
                                                Add
                                            </Button>
                                        )}

                                        {canDecrease && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onDecrease(item)
                                                }
                                                className="bg-orange-600 px-3 py-2 hover:bg-orange-700"
                                            >
                                                <PackageMinus className="h-4 w-4" />
                                                Remove
                                            </Button>
                                        )}

                                        {canAdjust && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onAdjust(item)
                                                }
                                                className="bg-slate-600 px-3 py-2 hover:bg-slate-700"
                                            >
                                                Adjust
                                            </Button>
                                        )}

                                        {canSettings && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onSettings(item)
                                                }
                                                className="bg-indigo-600 px-3 py-2 hover:bg-indigo-700"
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