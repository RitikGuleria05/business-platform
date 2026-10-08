import api from "../api";
import type {Product,CreateProductRequest,UpdateProductRequest} from "../../types/Products/product.types";

export const productApi = {
    
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>("/Product");

        return response.data;
    },

    getById: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(
            `/Product/${id}`
        );

        return response.data;
    },

    create: async (request: CreateProductRequest): Promise<Product> => {
        const response = await api.post<Product>(
            "/Product",
            request
        );

        return response.data;
    },

    update: async (id: string,request: UpdateProductRequest): Promise<Product> => {
        const response = await api.put<Product>(
            `/Product/${id}`,
            request
        );

        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/Product/${id}`);
    },
};