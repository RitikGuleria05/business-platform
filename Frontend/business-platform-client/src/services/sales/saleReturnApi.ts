import type {CreateSaleReturnRequest,SaleReturnResponse} from "../../types/Sales/sale.types";
import api from "../api";

export const createSaleReturn = async (data: CreateSaleReturnRequest): Promise<SaleReturnResponse> => {
    const response = await api.post<SaleReturnResponse>(
        "/SaleReturns",
        data
    );

    return response.data;
};

export const getSaleReturnById = async (id: string): Promise<SaleReturnResponse> => {
    const response = await api.get<SaleReturnResponse>(
        `/SaleReturns/${id}`
    );

    return response.data;
};

export const getReturnsBySaleId = async (saleId: string): Promise<SaleReturnResponse[]> => {
    const response = await api.get<SaleReturnResponse[]>(
        `/SaleReturns/sale/${saleId}`
    );

    return response.data;
};