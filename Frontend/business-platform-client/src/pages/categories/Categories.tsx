import { useState } from 'react';
import { useCategories } from '../../hooks/categories/useCategories';
import { CategoryTable } from '../../components/categories/CategoryTable';
import { CategoryFormModal } from '../../components/categories/CategoryFormModal';
import Button from '../../components/ui/Button';

export default function CategoriesPage() {
  const { categories, loading, error, addCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Manage product categories for your inventory</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Category</Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <CategoryTable categories={categories} loading={loading} />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addCategory}
      />
    </div>
  );
}