
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";

import type { Inventory } from "../../types/Inventory/inventory.types";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface InventorySettingsModalProps {
    isOpen: boolean;
    inventory: Inventory | null;
    loading?: boolean;
    onSubmit: (
        minimumStock: number,
        maximumStock: number,
        reorderLevel: number
    ) => Promise<void>;
    onClose: () => void;
}

function InventorySettingsModal({
    isOpen,
    inventory,
    loading = false,
    onSubmit,
    onClose,
}: InventorySettingsModalProps) {
    const [minimumStock, setMinimumStock] = useState("");
    const [maximumStock, setMaximumStock] = useState("");
    const [reorderLevel, setReorderLevel] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (inventory && isOpen) {
            setMinimumStock(String(inventory.minimumStock));
            setMaximumStock(String(inventory.maximumStock));
            setReorderLevel(String(inventory.reorderLevel));
            setError("");
        }
    }, [inventory, isOpen]);

    if (!inventory) {
        return null;
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const minimum = Number(minimumStock);
        const maximum = Number(maximumStock);
        const reorder = Number(reorderLevel);

        if (
            minimumStock === "" ||
            maximumStock === "" ||
            reorderLevel === "" ||
            Number.isNaN(minimum) ||
            Number.isNaN(maximum) ||
            Number.isNaN(reorder) ||
            minimum < 0 ||
            maximum < 0 ||
            reorder < 0
        ) {
            setError("All values must be valid and non-negative.");
            return;
        }

        if (minimum > maximum) {
            setError("Minimum stock cannot exceed maximum stock.");
            return;
        }

        if (reorder > maximum) {
            setError("Reorder level cannot exceed maximum stock.");
            return;
        }

        setError("");

        await onSubmit(minimum, maximum, reorder);
    };

    return (
        <Modal
            isOpen={isOpen}
            title="Inventory settings"
            description={`Configure stock limits for ${inventory.productName}.`}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                        <SlidersHorizontal className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {inventory.productName}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                            SKU: {inventory.sku}
                        </p>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                            Current stock:{" "}
                            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                                {inventory.quantityInStock}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        id="minimumStock"
                        label="Minimum stock"
                        type="number"
                        min="0"
                        step="1"
                        value={minimumStock}
                        onChange={(event) => setMinimumStock(event.target.value)}
                        disabled={loading}
                    />

                    <Input
                        id="maximumStock"
                        label="Maximum stock"
                        type="number"
                        min="0"
                        step="1"
                        value={maximumStock}
                        onChange={(event) => setMaximumStock(event.target.value)}
                        disabled={loading}
                    />

                    <Input
                        id="reorderLevel"
                        label="Reorder level"
                        type="number"
                        min="0"
                        step="1"
                        value={reorderLevel}
                        onChange={(event) => setReorderLevel(event.target.value)}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                    >
                        {error}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="!w-full !bg-white !text-slate-700 !border !border-slate-300 hover:!bg-slate-50 sm:!w-auto dark:!bg-slate-900 dark:!text-slate-200 dark:!border-slate-700 dark:hover:!bg-slate-800"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={loading}
                        className="!w-full sm:!w-auto"
                    >
                        Save settings
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default InventorySettingsModal;
