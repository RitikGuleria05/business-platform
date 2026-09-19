import Card from '../ui/Card';
import Badge from '../ui/Badge';
import type { Category } from '../../types/Categories/category';

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
}

export function CategoryTable({ categories, loading }: CategoryTableProps) {
  if (loading && categories.length === 0) {
    return <Card className="py-8 text-center text-slate-500">Loading categories...</Card>;
  }

  if (!loading && categories.length === 0) {
    return <Card className="py-8 text-center text-slate-500">No categories found. Create one to get started.</Card>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-mono text-xs text-slate-400">#{cat.id}</td>
              <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
              <td className="px-6 py-4 text-slate-500">{cat.description || '—'}</td>
              <td className="px-6 py-4">
                <Badge variant={cat.isActive ? 'success' : 'neutral'}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}