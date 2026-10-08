import api from "../api";
import type { ProductReport } from "../../types/reports/reports.types";

export const productReportApi = {
    get: async (from: string,to: string): Promise<ProductReport> => {
        const response = await api.get<ProductReport>(
            "/Reports/products",
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