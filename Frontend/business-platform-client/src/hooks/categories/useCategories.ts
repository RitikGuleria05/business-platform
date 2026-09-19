import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../../services/categories/categoryApi';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/Categories/category';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (payload: CreateCategoryRequest) => {
    const created = await categoryApi.create(payload);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const editCategory = async (id: string, payload: UpdateCategoryRequest) => {
    const updated = await categoryApi.update(id, payload);
    setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
    return updated;
  };

  const removeCategory = async (id: string) => {
    await categoryApi.delete(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
};