import { Edit, Trash2 } from "lucide-react";

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
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-500">
                    Loading products...
                </p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-500">
                    No products found.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Product
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            SKU
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Category
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Selling Price
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Stock
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </th>

                        {(canEdit || canDelete) && (
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="border-b border-slate-100 last:border-0"
                        >
                            <td className="px-4 py-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {product.name}
                                    </p>

                                    {product.barcode && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Barcode: {product.barcode}
                                        </p>
                                    )}
                                </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                                {product.sku}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                                {product.categoryName}
                            </td>

                            <td className="px-4 py-4 text-sm font-medium text-slate-900">
                                ₹{product.sellingPrice.toFixed(2)}
                            </td>

                            <td className="px-4 py-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {product.quantityInStock}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Reorder: {product.reorderLevel}
                                    </p>
                                </div>
                            </td>

                            <td className="px-4 py-4">
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

                            {(canEdit || canDelete) && (
                                <td className="px-4 py-4">
                                    <div className="flex justify-end gap-2">
                                        {canEdit && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(product)
                                                }
                                                className="bg-white px-3 py-2 text-slate-700 hover:bg-slate-100"
                                                title="Edit product"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                        )}

                                        {canDelete && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(product)
                                                }
                                                className="bg-red-600 px-3 py-2 hover:bg-red-700"
                                                title="Delete product"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
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

export default ProductTable;