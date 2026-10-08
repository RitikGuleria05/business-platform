import { useMemo, useState } from "react";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

import InventoryTable from "../../components/inventory/InventoryTable";
import StockActionModal from "../../components/inventory/StockActionModal";
import InventorySettingsModal from "../../components/inventory/InventorySettingsModal";

import { useInventory } from "../../hooks/inventory/useInventory";
import { useAuth } from "../../hooks/auth/AuthContext";

import type { Inventory as InventoryItem } from "../../types/Inventory/inventory.types";

type Filter = "all" | "low" | "out";

type StockAction = "increase" | "decrease" | "adjust";

function Inventory() {
    const { hasPermission } = useAuth();

    const {
        inventory,
        loading,
        error,
        increaseStock,
        decreaseStock,
        adjustStock,
        updateSettings,
    } = useInventory();

    const [filter, setFilter] = useState<Filter>("all");

    const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);

    const [stockAction, setStockAction] = useState<StockAction | null>(null);

    const [settingsItem, setSettingsItem] = useState<InventoryItem | null>(null);

    const [actionLoading, setActionLoading] = useState(false);

    const canView = hasPermission("Inventory.View");

    const canIncrease =  hasPermission("Inventory.Increase");

    const canDecrease = hasPermission("Inventory.Decrease");

    const canAdjust = hasPermission("Inventory.Adjust");

    const canSettings = hasPermission("Inventory.Settings");

    const lowStockCount = useMemo(() =>
            inventory.filter(
                (item) =>
                    item.quantityInStock > 0 &&
                    item.quantityInStock <=
                        item.reorderLevel
            ).length,
        [inventory]
    );

    const outOfStockCount = useMemo(() =>
            inventory.filter(
                (item) =>
                    item.quantityInStock === 0
            ).length,
        [inventory]
    );

    const filteredInventory = useMemo(() => {
        if (filter === "low") {
            return inventory.filter(
                (item) =>
                    item.quantityInStock > 0 &&
                    item.quantityInStock <=
                        item.reorderLevel
            );
        }

        if (filter === "out") {
            return inventory.filter(
                (item) =>
                    item.quantityInStock === 0
            );
        }

        return inventory;
    }, [inventory, filter]);

    const openStockAction = (
        item: InventoryItem,
        action: StockAction
    ) => {
        setSelectedInventory(item);
        setStockAction(action);
    };

    const closeStockAction = () => {
        if (actionLoading) return;

        setSelectedInventory(null);
        setStockAction(null);
    };

    const handleStockSubmit = async (quantity: number,reason?: string) => {
        if (!selectedInventory || !stockAction) {
            return;
        }

        try {
            setActionLoading(true);

            if (stockAction === "increase") {
                await increaseStock({
                    productId:
                        selectedInventory.productId,
                    quantity,
                });
            }

            if (stockAction === "decrease") {
                await decreaseStock({
                    productId:
                        selectedInventory.productId,
                    quantity,
                });
            }

            if (stockAction === "adjust") {
                await adjustStock({
                    productId:
                        selectedInventory.productId,
                    newQuantity: quantity,
                    reason,
                });
            }

            setSelectedInventory(null);
            setStockAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSettingsSubmit = async (
        minimumStock: number,
        maximumStock: number,
        reorderLevel: number
    ) => {
        if (!settingsItem) {
            return;
        }

        try {
            setActionLoading(true);

            await updateSettings(
                settingsItem.productId,
                {
                    minimumStock,
                    maximumStock,
                    reorderLevel,
                }
            );

            setSettingsItem(null);
        } finally {
            setActionLoading(false);
        }
    };

    if (!canView) {
        return (
            <Card>
                <p className="text-sm text-red-600">
                    You do not have permission to view inventory.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Monitor stock levels and manage inventory.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Total Products
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {inventory.length}
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Low Stock
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <p className="text-2xl font-bold text-slate-900">
                            {lowStockCount}
                        </p>

                        <Badge variant="warning">
                            Needs attention
                        </Badge>
                    </div>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Out of Stock
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <p className="text-2xl font-bold text-slate-900">
                            {outOfStockCount}
                        </p>

                        <Badge variant="danger">
                            Empty
                        </Badge>
                    </div>
                </Card>
            </div>

            <Card className="p-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-4">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            filter === "all"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("low")}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            filter === "low"
                                ? "bg-yellow-50 text-yellow-700"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Low Stock
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("out")}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            filter === "out"
                                ? "bg-red-50 text-red-700"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Out of Stock
                    </button>
                </div>

                <InventoryTable
                    inventory={filteredInventory}
                    loading={loading}
                    canIncrease={canIncrease}
                    canDecrease={canDecrease}
                    canAdjust={canAdjust}
                    canSettings={canSettings}
                    onIncrease={(item) =>
                        openStockAction(
                            item,
                            "increase"
                        )
                    }
                    onDecrease={(item) =>
                        openStockAction(
                            item,
                            "decrease"
                        )
                    }
                    onAdjust={(item) =>
                        openStockAction(
                            item,
                            "adjust"
                        )
                    }
                    onSettings={setSettingsItem}
                />
            </Card>

            <StockActionModal
                isOpen={
                    stockAction !== null &&
                    selectedInventory !== null
                }
                action={stockAction ?? "increase"}
                inventory={selectedInventory}
                loading={actionLoading}
                onSubmit={handleStockSubmit}
                onClose={closeStockAction}
            />

            <InventorySettingsModal
                isOpen={settingsItem !== null}
                inventory={settingsItem}
                loading={actionLoading}
                onSubmit={handleSettingsSubmit}
                onClose={() => {
                    if (!actionLoading) {
                        setSettingsItem(null);
                    }
                }}
            />
        </div>
    );
}

export default Inventory;