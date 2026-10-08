import api from "../api";
import type {SalesTrend} from "../../types/reports/reports";

export const salesTrendApi = {
    get: async (
        from: string,
        to: string
    ): Promise<SalesTrend[]> => {
        const response = await api.get<SalesTrend[]>(
            "/Reports/sales-trend",
            {
                params: {
                    from,
                    to,
                },
            }
        );

        return response.data;
    },
};