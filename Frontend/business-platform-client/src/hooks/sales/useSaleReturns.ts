import { useCallback, useState } from "react";
import {createSaleReturn,getReturnsBySaleId,getSaleReturnById} from "../../services/sales/saleReturnApi";
import type {CreateSaleReturnRequest,SaleReturnResponse} from "../../types/Sales/sale.types";

export const useSaleReturns = () => {
    const [returns, setReturns] = useState<SaleReturnResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReturnsBySaleId = useCallback(
        async (saleId: string) => {
            try {
                setLoading(true);
                setError(null);

                const data = await getReturnsBySaleId(saleId);

                setReturns(data);

                return data;
            } catch (err) {
                setError("Failed to load sale returns.");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchReturnById = async (id: string) => {
        return await getSaleReturnById(id);
    };

    const addReturn = async (data: CreateSaleReturnRequest) => {
        try {
            setError(null);

            const saleReturn = await createSaleReturn(data);

            setReturns((previous) => [
                saleReturn,
                ...previous,
            ]);

            return saleReturn;
        } catch (err) {
            setError("Failed to create sale return.");
            throw err;
        }
    };

    return {
        returns,
        loading,
        error,
        fetchReturnsBySaleId,
        fetchReturnById,
        addReturn,
    };
};