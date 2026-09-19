import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { CreateCategoryRequest } from '../../types/Categories/category';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<any>;
}

export function CategoryFormModal({ isOpen, onClose, onSubmit }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFieldError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      setName('');
      setDescription('');
      onClose();
    } catch {
      // Hook handles global error state
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            id="cat-name"
            placeholder="e.g. Beverages"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldError('');
            }}
            error={fieldError}
          />
          <Input
            label="Description (Optional)"
            id="cat-desc"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Category
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}