
import { useMemo, useState } from "react";
import {
    AlertTriangle,
    Package,
    PackageX,
} from "lucide-react";

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
    const canIncrease = hasPermission("Inventory.Increase");
    const canDecrease = hasPermission("Inventory.Decrease");
    const canAdjust = hasPermission("Inventory.Adjust");
    const canSettings = hasPermission("Inventory.Settings");

    const lowStockCount = useMemo(
        () =>
            inventory.filter(
                (item) =>
                    item.quantityInStock > 0 &&
                    item.quantityInStock <= item.reorderLevel
            ).length,
        [inventory]
    );

    const outOfStockCount = useMemo(
        () =>
            inventory.filter(
                (item) => item.quantityInStock === 0
            ).length,
        [inventory]
    );

    const filteredInventory = useMemo(() => {
        if (filter === "low") {
            return inventory.filter(
                (item) =>
                    item.quantityInStock > 0 &&
                    item.quantityInStock <= item.reorderLevel
            );
        }

        if (filter === "out") {
            return inventory.filter(
                (item) => item.quantityInStock === 0
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

    const handleStockSubmit = async (
        quantity: number,
        reason?: string
    ) => {
        if (!selectedInventory || !stockAction) return;

        try {
            setActionLoading(true);

            if (stockAction === "increase") {
                await increaseStock({
                    productId: selectedInventory.productId,
                    quantity,
                });
            }

            if (stockAction === "decrease") {
                await decreaseStock({
                    productId: selectedInventory.productId,
                    quantity,
                });
            }

            if (stockAction === "adjust") {
                await adjustStock({
                    productId: selectedInventory.productId,
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
        if (!settingsItem) return;

        try {
            setActionLoading(true);

            await updateSettings(settingsItem.productId, {
                minimumStock,
                maximumStock,
                reorderLevel,
            });

            setSettingsItem(null);
        } finally {
            setActionLoading(false);
        }
    };

    if (!canView) {
        return (
            <Card>
                <p className="text-sm text-red-600 dark:text-red-400">
                    You do not have permission to view inventory.
                </p>
            </Card>
        );
    }

    const filters: {
        value: Filter;
        label: string;
        count?: number;
    }[] = [
        { value: "all", label: "All products" },
        { value: "low", label: "Low stock", count: lowStockCount },
        { value: "out", label: "Out of stock", count: outOfStockCount },
    ];

    return (
        <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-6">
            <header>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                    Inventory
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Monitor stock levels and manage inventory across your products.
                </p>
            </header>

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="min-w-0">{error}</p>
                </div>
            )}

            <section
                aria-label="Inventory summary"
                className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3"
            >
                <Card className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total products
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {inventory.length}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Products being tracked
                            </p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Low stock
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {lowStockCount}
                            </p>
                            <div className="mt-2">
                                <Badge variant="warning">Needs attention</Badge>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Out of stock
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {outOfStockCount}
                            </p>
                            <div className="mt-2">
                                <Badge variant="danger">Unavailable</Badge>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                            <PackageX className="h-5 w-5" />
                        </div>
                    </div>
                </Card>
            </section>

            <Card className="min-w-0 !p-0">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Stock overview
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Review quantities, stock limits, and available actions.
                        </p>
                    </div>

                    <div
                        className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
                        aria-label="Filter inventory"
                    >
                        {filters.map((item) => {
                            const isActive = filter === item.value;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setFilter(item.value)}
                                    aria-pressed={isActive}
                                    className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                                        isActive
                                            ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                                            : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                    {item.count !== undefined && (
                                        <span
                                            className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                                                    : "bg-slate-200/70 text-slate-600 dark:bg-slate-600 dark:text-slate-200"
                                            }`}
                                        >
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <InventoryTable
                    inventory={filteredInventory}
                    loading={loading}
                    canIncrease={canIncrease}
                    canDecrease={canDecrease}
                    canAdjust={canAdjust}
                    canSettings={canSettings}
                    onIncrease={(item) => openStockAction(item, "increase")}
                    onDecrease={(item) => openStockAction(item, "decrease")}
                    onAdjust={(item) => openStockAction(item, "adjust")}
                    onSettings={setSettingsItem}
                />
            </Card>

            <StockActionModal
                isOpen={stockAction !== null && selectedInventory !== null}
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
