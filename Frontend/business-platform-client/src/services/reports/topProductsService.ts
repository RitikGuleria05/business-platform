import api from "../api";
import type { TopProduct } from "../../types/reports/reports";

export const topProductsApi = {
    get: async (count = 5): Promise<TopProduct[]> => {
        const response = await api.get<TopProduct[]>(
            "/Reports/top-products",
            {
                params: {
                    count,
                },
            }
        );

        return response.data;
    },
};