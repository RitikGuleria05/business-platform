import { useCallback, useEffect, useState } from "react";
import { customerReportApi } from "../../services/reports/customerReportService";
import type { CustomerReport } from "../../types/reports/reports.types";

export const useCustomerReport = (from: string,to: string) => {
    const [data, setData] = useState<CustomerReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomerReport = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await customerReportApi.get(from, to);

            setData(result);
        } catch {
            setError("Failed to load customer report.");
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchCustomerReport();
    }, [fetchCustomerReport]);

    return {
        data,
        loading,
        error,
        refetch: fetchCustomerReport,
    };
};