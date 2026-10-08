import { useEffect, useState } from "react";
import type { FormEvent } from "react";

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
    onSubmit: (
        quantity: number,
        reason?: string
    ) => Promise<void>;
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
        increase: "Increase Stock",
        decrease: "Decrease Stock",
        adjust: "Adjust Stock",
    };

    const descriptions = {
        increase: "Add stock to the current inventory.",
        decrease: "Remove stock from the current inventory.",
        adjust: "Set the exact current stock quantity.",
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
            setError(
                "Quantity cannot be greater than current stock."
            );

            return;
        }

        setError("");

        await onSubmit(
            value,
            reason.trim() || undefined
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            title={titles[action]}
            description={descriptions[action]}
            onClose={onClose}
            maxWidth="max-w-md"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">
                        {inventory.productName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        SKU: {inventory.sku}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                        Current stock:{" "}
                        <span className="font-semibold text-slate-900">
                            {inventory.quantityInStock}
                        </span>
                    </p>
                </div>

                <Input
                    id="quantity"
                    label={
                        action === "adjust"
                            ? "New Quantity"
                            : "Quantity"
                    }
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                        setQuantity(event.target.value)
                    }
                    error={error}
                    disabled={loading}
                />

                <Input
                    id="reason"
                    label="Reason (optional)"
                    placeholder="e.g. New stock received"
                    value={reason}
                    onChange={(event) =>
                        setReason(event.target.value)
                    }
                    disabled={loading}
                />

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={loading}
                    >
                        {titles[action]}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default StockActionModal;