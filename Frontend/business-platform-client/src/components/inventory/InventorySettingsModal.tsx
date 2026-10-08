import { useEffect, useState } from "react";
import type { FormEvent } from "react";

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
            setMinimumStock(
                String(inventory.minimumStock)
            );

            setMaximumStock(
                String(inventory.maximumStock)
            );

            setReorderLevel(
                String(inventory.reorderLevel)
            );

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
            setError(
                "Minimum stock cannot exceed maximum stock."
            );
            return;
        }

        if (reorder > maximum) {
            setError(
                "Reorder level cannot exceed maximum stock."
            );
            return;
        }

        setError("");

        await onSubmit(
            minimum,
            maximum,
            reorder
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            title="Inventory Settings"
            description={`Configure stock limits for ${inventory.productName}.`}
            onClose={onClose}
            maxWidth="max-w-md"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <Input
                    id="minimumStock"
                    label="Minimum Stock"
                    type="number"
                    min="0"
                    step="1"
                    value={minimumStock}
                    onChange={(event) =>
                        setMinimumStock(
                            event.target.value
                        )
                    }
                    disabled={loading}
                />

                <Input
                    id="maximumStock"
                    label="Maximum Stock"
                    type="number"
                    min="0"
                    step="1"
                    value={maximumStock}
                    onChange={(event) =>
                        setMaximumStock(
                            event.target.value
                        )
                    }
                    disabled={loading}
                />

                <Input
                    id="reorderLevel"
                    label="Reorder Level"
                    type="number"
                    min="0"
                    step="1"
                    value={reorderLevel}
                    onChange={(event) =>
                        setReorderLevel(
                            event.target.value
                        )
                    }
                    disabled={loading}
                />

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

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
                        Save Settings
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default InventorySettingsModal;