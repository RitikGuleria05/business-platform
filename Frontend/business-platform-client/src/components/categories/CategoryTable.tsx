import { Edit, Trash2 } from "lucide-react";
import type { Category } from "../../types/Categories/category.types.ts";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

interface CategoryTableProps {
    categories: Category[];
    loading?: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

function CategoryTable({
    categories,
    loading = false,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    if (loading) {
        return (
            <div className="space-y-3 p-4 sm:p-5">
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-14 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-14 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-14 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <span className="text-sm font-semibold text-slate-500">
                        —
                    </span>
                </div>

                <p className="text-sm font-medium text-slate-700">
                    No categories found
                </p>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                    There are no product categories to display yet.
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5">
                            Name
                        </th>

                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5">
                            Description
                        </th>

                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5">
                            Status
                        </th>

                        {(canEdit || canDelete) && (
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {categories.map((category) => (
                        <tr
                            key={category.id}
                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                            <td className="max-w-[240px] px-4 py-4 align-middle sm:px-5">
                                <p className="break-words text-sm font-medium text-slate-900">
                                    {category.name}
                                </p>
                            </td>

                            <td className="max-w-[360px] px-4 py-4 align-middle sm:px-5">
                                <p className="break-words text-sm leading-5 text-slate-600">
                                    {category.description || "—"}
                                </p>
                            </td>

                            <td className="px-4 py-4 align-middle sm:px-5">
                                <Badge
                                    variant={
                                        category.isActive
                                            ? "success"
                                            : "neutral"
                                    }
                                >
                                    {category.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </Badge>
                            </td>

                            {(canEdit || canDelete) && (
                                <td className="px-4 py-4 align-middle sm:px-5">
                                    <div className="flex justify-end gap-2">
                                        {canEdit && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(category)
                                                }
                                                className="bg-white px-3 py-2 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                                                title="Edit category"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    Edit
                                                </span>
                                            </Button>
                                        )}

                                        {canDelete && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(category)
                                                }
                                                className="bg-red-600 px-3 py-2 hover:bg-red-700"
                                                title="Delete category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    Delete
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CategoryTable;