import {
    Edit,
    PackageOpen,
    Trash2,
} from "lucide-react";

import type { Product } from "../../types/Products/product.types";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

interface ProductTableProps {
    products: Product[];
    loading?: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

function ProductTable({
    products,
    loading = false,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: ProductTableProps) {
    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Product
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                SKU
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Category
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Selling Price
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Stock
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Status
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({
                            length: 6,
                        }).map((_, index) => (
                            <tr
                                key={index}
                                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                            >
                                <td className="px-5 py-4">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-6 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                                </td>

                                <td className="px-5 py-4">
                                    <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <PackageOpen className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    No products found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    There are no products available for the selected category.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Product
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            SKU
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Category
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Selling Price
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Stock
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                        >
                            <td className="px-5 py-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {product.name}
                                    </p>

                                    {product.barcode && (
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Barcode:{" "}
                                            {product.barcode}
                                        </p>
                                    )}
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {product.sku}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {product.categoryName}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    ₹
                                    {product.sellingPrice.toFixed(
                                        2
                                    )}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {
                                            product.quantityInStock
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Reorder:{" "}
                                        {
                                            product.reorderLevel
                                        }
                                    </p>
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <Badge
                                    variant={
                                        product.isActive
                                            ? "success"
                                            : "neutral"
                                    }
                                >
                                    {product.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </Badge>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    {canEdit && (
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                onEdit(
                                                    product
                                                )
                                            }
                                            aria-label={`Edit ${product.name}`}
                                            className="!bg-white !px-3 !py-2 !text-slate-700 !ring-1 !ring-slate-300 !shadow-none !hover:bg-slate-50 dark:!bg-slate-900 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-800"
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
                                                onDelete(
                                                    product
                                                )
                                            }
                                            aria-label={`Delete ${product.name}`}
                                            className="!bg-red-600 !px-3 !py-2 !text-white !shadow-none !hover:bg-red-700 dark:!bg-red-500 dark:!hover:bg-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Delete
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductTable;