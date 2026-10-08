import { useCallback, useEffect, useState } from "react";
import { productReportApi } from "../../services/reports/productReportService";
import type { ProductReport } from "../../types/reports/reports.types";

export const useProductReport = (from: string, to: string) => {
    const [data, setData] = useState<ProductReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await productReportApi.get(from, to);

            console.log("PRODUCT REPORT RESULT:", result);
            console.log("FIRST PRODUCT:", result.products[0]);

            setData(result);
        } catch {
            setError("Failed to load product report.");
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchProductReport();
    }, [fetchProductReport]);

    return {
        data,
        loading,
        error,
        refetch: fetchProductReport,
    };
};