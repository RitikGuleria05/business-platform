import { useCallback, useEffect, useState } from "react";
import { salesReportApi } from "../../services/reports/salesReportService";
import type { SalesReport } from "../../types/reports/reports.types";

export const useSalesReport = (from: string, to: string) => {
    const [data, setData] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSalesReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await salesReportApi.get(from, to);

            setData(result);
        } catch {
            setError("Failed to load sales report.");
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchSalesReport();
    }, [fetchSalesReport]);

    return {
        data,
        loading,
        error,
        refetch: fetchSalesReport,
    };
};