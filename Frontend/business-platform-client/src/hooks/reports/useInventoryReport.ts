import { useCallback, useEffect, useState } from "react";
import { inventoryReportApi } from "../../services/reports/inventoryReportService";
import type { InventoryReport } from "../../types/reports/reports.types";

export const useInventoryReport = () => {
    const [data, setData] = useState<InventoryReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventoryReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await inventoryReportApi.get();

            setData(result);
        } catch {
            setError("Failed to load inventory report.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventoryReport();
    }, [fetchInventoryReport]);

    return {
        data,
        loading,
        error,
        refetch: fetchInventoryReport,
    };
};