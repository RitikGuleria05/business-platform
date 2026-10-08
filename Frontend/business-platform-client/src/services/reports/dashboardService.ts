import api from "../api";
import type { DashboardSummary } from "../../types/reports/reports";

export const dashboardApi = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>(
            "/Reports/dashboard"
        );

        return response.data;
    },
};