import type {CreateSaleRequest,SaleResponse} from "../../types/Sales/sale.types";
import api from "../api";

export const getSales = async (): Promise<SaleResponse[]> => {
    const response = await api.get<SaleResponse[]>("/Sales");

    return response.data;
};

export const getSaleById = async (id: string): Promise<SaleResponse> => {
    const response = await api.get<SaleResponse>(`/Sales/${id}`);

    return response.data;
};

export const createSale = async (data: CreateSaleRequest): Promise<SaleResponse> => {
    const response = await api.post<SaleResponse>(
        "/Sales",
        data
    );

    return response.data;
};

export const cancelSale = async (id: string): Promise<void> => {
    await api.post(`/Sales/${id}/cancel`);
};