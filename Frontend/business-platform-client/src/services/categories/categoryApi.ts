import api from "../api";

import type {Category,CreateCategoryRequest,UpdateCategoryRequest} from "../../types/Categories/category.types.ts";

export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>("/Categories");
        return response.data;
    },

    getById: async (id: string): Promise<Category> => {
        const response = await api.get<Category>(
            `/Categories/${id}`
        );
        return response.data;
    },

    create: async (request: CreateCategoryRequest): Promise<Category> => {
        const response = await api.post<Category>(
            "/Categories",
            request
        );
        return response.data;
    },

    update: async (id: string,request: UpdateCategoryRequest): Promise<Category> => {
        const response = await api.put<Category>(
            `/Categories/${id}`,
            request
        );
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/Categories/${id}`);
    },
};