import api from "../api";
import type { InventoryReport } from "../../types/reports/reports.types";

export const inventoryReportApi = {
    get: async (): Promise<InventoryReport> => {
        const response = await api.get<InventoryReport>(
            "/Reports/inventory"
        );

        return response.data;
    },
};