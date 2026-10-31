import {
    useCallback,
    useEffect,
    useState,
} from "react";

import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
} from "../../types/Products/product.types";

import { productApi } from "../../services/products/productApi";
import { getApiErrorMessage } from "../../utils/apiError";

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = useCallback(
        async (categoryId?: string) => {
            try {
                setLoading(true);
                setError(null);

                const data = await productApi.getAll(
                    categoryId
                );

                setProducts(data);
            } catch (error) {
                setError(
                    getApiErrorMessage(
                        error,
                        "Failed to load products."
                    )
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const addProduct = async (request: CreateProductRequest) => {
        try {
            setError(null);

            const product =
                await productApi.create(request);

            setProducts((current) => [
                ...current,
                product,
            ]);

            return product;
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to create product."
            );

            setError(message);
            throw error;
        }
    };

    const editProduct = async (id: string,request: UpdateProductRequest) => {
        try {
            setError(null);

            const updatedProduct =
                await productApi.update(
                    id,
                    request
                );

            setProducts((current) =>
                current.map((product) =>
                    product.id === id
                        ? updatedProduct
                        : product
                )
            );

            return updatedProduct;
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to update product."
            );

            setError(message);
            throw error;
        }
    };

    const removeProduct = async (id: string) => {
        try {
            setError(null);

            await productApi.delete(id);

            setProducts((current) =>
                current.filter(
                    (product) => product.id !== id
                )
            );
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Failed to delete product."
            );

            setError(message);
            throw error;
        }
    };

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return {
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        editProduct,
        removeProduct,
    };
}