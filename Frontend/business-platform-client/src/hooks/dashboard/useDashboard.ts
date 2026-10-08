import { useCallback, useEffect, useState } from "react";
import { dashboardApi } from "../../services/reports/dashboardService";
import type { DashboardSummary } from "../../types/reports/reports";

export const useDashboard = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardApi.getSummary();

            setData(result);
        } catch (error) {
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        data,
        loading,
        error,
        refetch: fetchDashboard,
    };
};