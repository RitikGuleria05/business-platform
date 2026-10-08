import { useCallback, useEffect, useState } from "react";

import type { Inventory, UpdateInventoryRequest, IncreaseStockRequest, DecreaseStockRequest, AdjustStockRequest } from "../../types/Inventory/inventory.types";

import { inventoryApi } from "../../services/inventory/inventoryApi";
import { getApiErrorMessage } from "../../utils/apiError";

export function useInventory() {
    const [inventory, setInventory] = useState<Inventory[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await inventoryApi.getAll();

            setInventory(data);
        } catch (error) {
            setError(getApiErrorMessage(error, "Failed to load inventory."));
        } finally {
            setLoading(false);
        }
    }, []);

    const increaseStock = async (request: IncreaseStockRequest) => {
        try {
            setError(null);

            await inventoryApi.increaseStock(request);

            await loadInventory();
        } catch (error) {
            const message = getApiErrorMessage(error, "Failed to increase stock.");

            setError(message);
            throw error;
        }
    };

    const decreaseStock = async (request: DecreaseStockRequest) => {
        try {
            setError(null);

            await inventoryApi.decreaseStock(request);

            await loadInventory();
        } catch (error) {
            const message = getApiErrorMessage(error, "Failed to decrease stock.");

            setError(message);
            throw error;
        }
    };

    const adjustStock = async (request: AdjustStockRequest) => {
        try {
            setError(null);

            await inventoryApi.adjustStock(request);

            await loadInventory();
        } catch (error) {
            const message = getApiErrorMessage(error, "Failed to adjust stock.");

            setError(message);
            throw error;
        }
    };

    const updateSettings = async (productId: string, request: UpdateInventoryRequest) => {
        try {
            setError(null);

            await inventoryApi.updateSettings(
                productId,
                request
            );

            await loadInventory();
        } catch (error) {
            const message = getApiErrorMessage(error, "Failed to update inventory settings.");

            setError(message);
            throw error;
        }
    };

    const getLowStock = async (): Promise<Inventory[]> => {
        try {
            setError(null);

            return await inventoryApi.getLowStock();
        } catch (error) {
            const message = getApiErrorMessage(error, "Failed to load low-stock products.");

            setError(message);
            throw error;
        }
    };

    const getOutOfStock =
        async (): Promise<Inventory[]> => {
            try {
                setError(null);

                return await inventoryApi.getOutOfStock();
            } catch (error) {
                const message = getApiErrorMessage(error, "Failed to load out-of-stock products.");

                setError(message);
                throw error;
            }
        };

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    return {
        inventory,
        loading,
        error,
        loadInventory,
        increaseStock,
        decreaseStock,
        adjustStock,
        updateSettings,
        getLowStock,
        getOutOfStock,
    };
}