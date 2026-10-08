import { useCallback, useEffect, useState } from "react";
import {cancelSale,createSale,getSaleById,getSales} from "../../services/sales/saleApi";
import type {CreateSaleRequest,SaleResponse} from "../../types/Sales/sale.types";
import { SaleStatus } from "../../types/Sales/sale.types";

export const useSales = () => {
    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getSales();

            setSales(data);
        } catch (err) {
            setError("Failed to load sales.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const fetchSaleById = async (id: string) => {
        return await getSaleById(id);
    };

    const addSale = async (data: CreateSaleRequest) => {
        try {
            setError(null);

            const sale = await createSale(data);

            setSales((previous) => [
                sale,
                ...previous,
            ]);

            return sale;
        } catch (err) {
            setError("Failed to create sale.");
            throw err;
        }
    };

    const cancel = async (id: string) => {
        try {
            setError(null);

            await cancelSale(id);

            setSales((previous) =>
                previous.map((sale) =>
                    sale.id === id
                        ? {
                              ...sale,
                              status: SaleStatus.Cancelled,
                          }
                        : sale
                )
            );
        } catch (err) {
            setError("Failed to cancel sale.");
            throw err;
        }
    };

    return {
        sales,
        loading,
        error,
        fetchSales,
        fetchSaleById,
        addSale,
        cancel,
    };
};