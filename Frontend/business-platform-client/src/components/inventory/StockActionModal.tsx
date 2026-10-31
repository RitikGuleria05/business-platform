
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Boxes } from "lucide-react";

import type { Inventory } from "../../types/Inventory/inventory.types";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

type StockAction = "increase" | "decrease" | "adjust";

interface StockActionModalProps {
    isOpen: boolean;
    action: StockAction;
    inventory: Inventory | null;
    loading?: boolean;
    onSubmit: (quantity: number, reason?: string) => Promise<void>;
    onClose: () => void;
}

function StockActionModal({
    isOpen,
    action,
    inventory,
    loading = false,
    onSubmit,
    onClose,
}: StockActionModalProps) {
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setQuantity("");
            setReason("");
            setError("");
        }
    }, [isOpen, inventory, action]);

    if (!inventory) {
        return null;
    }

    const titles = {
        increase: "Increase stock",
        decrease: "Decrease stock",
        adjust: "Adjust stock",
    };

    const descriptions = {
        increase: "Record additional units received into inventory.",
        decrease: "Record units removed from the current inventory.",
        adjust: "Set the exact quantity currently available.",
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const value = Number(quantity);

        if (
            quantity === "" ||
            Number.isNaN(value) ||
            value < 0 ||
            (action !== "adjust" && value <= 0)
        ) {
            setError(
                action === "adjust"
                    ? "Enter a valid stock quantity."
                    : "Quantity must be greater than zero."
            );
            return;
        }

        if (
            action === "decrease" &&
            value > inventory.quantityInStock
        ) {
            setError("Quantity cannot be greater than current stock.");
            return;
        }

        setError("");

        await onSubmit(value, reason.trim() || undefined);
    };

    return (
        <Modal
            isOpen={isOpen}
            title={titles[action]}
            description={descriptions[action]}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                        <Boxes className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {inventory.productName}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                            SKU: {inventory.sku}
                        </p>

                        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Current stock
                            </span>
                            <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                                {inventory.quantityInStock}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                units
                            </span>
                        </div>
                    </div>
                </div>

                <Input
                    id="quantity"
                    label={action === "adjust" ? "New quantity" : "Quantity"}
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    error={error}
                    disabled={loading}
                />

                <Input
                    id="reason"
                    label="Reason (optional)"
                    placeholder="e.g. New stock received"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    disabled={loading}
                />

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
                        {titles[action]}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default StockActionModal;
