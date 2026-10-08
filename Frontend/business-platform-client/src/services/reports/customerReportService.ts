import api from "../api";
import type { CustomerReport } from "../../types/reports/reports.types";

export const customerReportApi = {
    get: async (from: string,to: string): Promise<CustomerReport> => {
        const response = await api.get<CustomerReport>(
            "/Reports/customers",
            {
                params: { from, to },
            }
        );

        return response.data;
    },
};