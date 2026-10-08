import api from "../api";

export const reportExportApi = {
    sales: async (from: string, to: string) => {
        const response = await api.get(
            "/Reports/sales/export/excel",
            {
                params: { from, to },
                responseType: "blob",
            }
        );

        return response.data;
    },

    products: async (from: string, to: string) => {
        const response = await api.get(
            "/Reports/products/export/excel",
            {
                params: { from, to },
                responseType: "blob",
            }
        );

        return response.data;
    },

    inventory: async () => {
        const response = await api.get(
            "/Reports/inventory/export/excel",
            {
                responseType: "blob",
            }
        );

        return response.data;
    },

    customers: async (from: string, to: string) => {
        const response = await api.get(
            "/Reports/customers/export/excel",
            {
                params: { from, to },
                responseType: "blob",
            }
        );

        return response.data;
    },
};