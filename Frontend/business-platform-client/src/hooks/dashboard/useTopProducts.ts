import {useCallback,useEffect,useState} from "react";

import { topProductsApi } from "../../services/reports/topProductsService";
import type { TopProduct } from "../../types/reports/reports";

export const useTopProducts = (count = 5) => {
    const [data, setData] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result =
                await topProductsApi.get(count);

            setData(result);
        } catch {
            setError("Failed to load top products.");
        } finally {
            setLoading(false);
        }
    }, [count]);

    useEffect(() => {
        fetchTopProducts();
    }, [fetchTopProducts]);

    return {
        data,
        loading,
        error,
        refetch: fetchTopProducts,
    };
};