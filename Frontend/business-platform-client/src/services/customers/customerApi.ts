import api from "../api";
import type {Customer,CreateCustomerRequest,UpdateCustomerRequest} from "../../types/Customers/customer.types";

export const customerApi = {
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>("/Customers");
        return response.data;
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await api.get<Customer>(`/Customers/${id}`);
        return response.data;
    },

    create: async (request: CreateCustomerRequest): Promise<Customer> => {
        const response = await api.post<Customer>(
            "/Customers",
            request
        );

        return response.data;
    },

    update: async (id: string,request: UpdateCustomerRequest): Promise<Customer> => {
        const response = await api.put<Customer>(
            `/Customers/${id}`,
            request
        );

        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/Customers/${id}`);
    },
};