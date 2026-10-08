import {useCallback,useEffect,useState} from "react";
import { salesTrendApi } from "../../services/reports/salesTrendService";
import type {SalesTrend} from "../../types/reports/reports";

export const useSalesTrend = (from: string,to: string) => {
    const [data, setData] = useState<SalesTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSalesTrend = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result =
                await salesTrendApi.get(from, to);

            setData(result);
        } catch {
            setError("Failed to load sales trend.");
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchSalesTrend();
    }, [fetchSalesTrend]);

    return {
        data,
        loading,
        error,
        refetch: fetchSalesTrend,
    };
};