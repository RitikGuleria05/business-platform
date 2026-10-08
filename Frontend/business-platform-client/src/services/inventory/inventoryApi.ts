import api from "../api";
import type {Inventory,UpdateInventoryRequest,IncreaseStockRequest,DecreaseStockRequest,AdjustStockRequest} from "../../types/Inventory/inventory.types";

export const inventoryApi = {
    getAll: async (): Promise<Inventory[]> => {
        const response =
            await api.get<Inventory[]>("/Inventory");

        return response.data;
    },

    getByProductId: async (productId: string): Promise<Inventory> => {
        const response =
            await api.get<Inventory>(
                `/Inventory/${productId}`
            );

        return response.data;
    },

    updateSettings: async (productId: string,request: UpdateInventoryRequest): Promise<void> => {
        await api.put(
            `/Inventory/${productId}`,
            request
        );
    },

    increaseStock: async (request: IncreaseStockRequest): Promise<void> => {
        await api.post(
            "/Inventory/increase",
            request
        );
    },

    decreaseStock: async (request: DecreaseStockRequest): Promise<void> => {
        await api.post(
            "/Inventory/decrease",
            request
        );
    },

    adjustStock: async (request: AdjustStockRequest): Promise<void> => {
        await api.post(
            "/Inventory/adjust",
            request
        );
    },

    getLowStock: async (): Promise<Inventory[]> => {
        const response =
            await api.get<Inventory[]>(
                "/Inventory/low-stock"
            );

        return response.data;
    },

    getOutOfStock: async (): Promise<Inventory[]> => {
        const response =
            await api.get<Inventory[]>(
                "/Inventory/out-of-stock"
            );

        return response.data;
    },
};