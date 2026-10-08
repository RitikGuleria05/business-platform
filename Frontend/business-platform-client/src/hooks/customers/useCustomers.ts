import { useCallback, useEffect, useState } from "react";
import { customerApi } from "../../services/customers/customerApi";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../../types/Customers/customer.types";
import { getApiErrorMessage } from "../../utils/apiError";

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await customerApi.getAll();
            setCustomers(data);
        } catch (error) {
            setError(getApiErrorMessage(error, "Failed to load customers."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const createCustomer = async (request: CreateCustomerRequest) => {
        try {
            setError(null);

            await customerApi.create(request);
            await loadCustomers();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to create customer."
            );

            setError(message);
            throw new Error(message);
        }
    };

    const updateCustomer = async (id: string, request: UpdateCustomerRequest) => {
        try {
            setError(null);

            await customerApi.update(id, request);
            await loadCustomers();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to update customer."
            );

            setError(message);
            throw new Error(message);
        }
    };

    const deleteCustomer = async (id: string) => {
        try {
            setError(null);

            await customerApi.delete(id);
            await loadCustomers();
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to delete customer."
            );

            setError(message);
            throw new Error(message);
        }
    };

    return {
        customers,
        loading,
        error,
        loadCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    };
}