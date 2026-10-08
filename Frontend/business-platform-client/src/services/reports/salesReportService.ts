import api from "../api";
import type { SalesReport } from "../../types/reports/reports.types";

export const salesReportApi = {
    get: async (from: string, to: string): Promise<SalesReport> => {
        const response = await api.get<SalesReport>("/Reports/sales", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },
};