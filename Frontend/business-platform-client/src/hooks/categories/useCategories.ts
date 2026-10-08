import { useCallback, useEffect, useState } from "react";

import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../../types/Categories/category.types.ts";

import { categoryApi } from "../../services/categories/categoryApi.ts";
import { getApiErrorMessage } from "../../utils/apiError.ts";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoryApi.getAll();

      setCategories(data);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to load categories."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (request: CreateCategoryRequest) => {
    try {
      setError(null);

      const category = await categoryApi.create(request);

      setCategories((current) => [
        ...current,
        category,
      ]);

      return category;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to create category."
      );

      setError(message);
      throw error;
    }
  };

  const editCategory = async (id: string, request: UpdateCategoryRequest) => {
    try {
      setError(null);

      const updatedCategory = await categoryApi.update(id, request);

      setCategories((current) =>
        current.map((category) =>
          category.id === id
            ? updatedCategory
            : category
        )
      );

      return updatedCategory;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to update category."
      );

      setError(message);
      throw error;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      setError(null);

      await categoryApi.delete(id);

      setCategories((current) =>
        current.filter(
          (category) => category.id !== id
        )
      );
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to delete category."
      );

      setError(message);
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}