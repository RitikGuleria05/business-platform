import api from "../api";
import type { LowStockProduct } from "../../types/reports/reports";

export const lowStockApi = {
    get: async (): Promise<LowStockProduct[]> => {
        const response = await api.get<LowStockProduct[]>("/Reports/low-stock");

        return response.data;
    },
};