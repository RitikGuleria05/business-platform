import { useCallback, useEffect, useState } from "react";
import { lowStockApi } from "../../services/reports/lowStockService";
import type { LowStockProduct } from "../../types/reports/reports";

export const useLowStock = () => {
    const [data, setData] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLowStock = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await lowStockApi.get();

            setData(result);
        } catch {
            setError("Failed to load low stock products.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLowStock();
    }, [fetchLowStock]);

    return {
        data,
        loading,
        error,
        refetch: fetchLowStock,
    };
};