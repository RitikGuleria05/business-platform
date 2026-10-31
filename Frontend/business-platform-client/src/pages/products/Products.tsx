import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";

import { useProducts } from "../../hooks/products/useProducts";
import { useCategories } from "../../hooks/categories/useCategories";
import { useAuth } from "../../hooks/auth/AuthContext";

import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
} from "../../types/Products/product.types";

function Products() {
    const {
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        editProduct,
        removeProduct,
    } = useProducts();

    const {
        categories,
        loading: categoriesLoading,
    } = useCategories();

    const { hasPermission } = useAuth();

    const canCreateProduct =
        hasPermission("Product.Create");

    const canEditProduct =
        hasPermission("Product.Edit");

    const canDeleteProduct =
        hasPermission("Product.Delete");

    const [selectedCategoryId, setSelectedCategoryId] =
        useState("");

    const [isFormOpen, setIsFormOpen] =
        useState(false);

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [productToDelete, setProductToDelete] =
        useState<Product | null>(null);

    const [formLoading, setFormLoading] =
        useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [actionError, setActionError] =
        useState<string | null>(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const ITEMS_PER_PAGE = 10;

    const handleCategoryChange = async (
        categoryId: string
    ) => {
        setSelectedCategoryId(categoryId);
        setCurrentPage(1);
        setActionError(null);

        await loadProducts(
            categoryId || undefined
        );
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setActionError(null);
        setIsFormOpen(true);
    };

    const handleEdit = (
        product: Product
    ) => {
        setSelectedProduct(product);
        setActionError(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        if (formLoading) {
            return;
        }

        setIsFormOpen(false);
        setSelectedProduct(null);
    };

    const handleSubmit = async (
        request:
            | CreateProductRequest
            | UpdateProductRequest
    ) => {
        try {
            setFormLoading(true);
            setActionError(null);

            if (selectedProduct) {
                await editProduct(
                    selectedProduct.id,
                    request as UpdateProductRequest
                );
            } else {
                await addProduct(
                    request as CreateProductRequest
                );
            }

            setIsFormOpen(false);
            setSelectedProduct(null);
        } catch {
            setActionError(
                "Unable to save this product."
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteRequest = (
        product: Product
    ) => {
        setActionError(null);
        setProductToDelete(product);
    };

    const handleDelete = async () => {
        if (!productToDelete) {
            return;
        }

        try {
            setDeleteLoading(true);
            setActionError(null);

            await removeProduct(
                productToDelete.id
            );

            setProductToDelete(null);
        } catch {
            setActionError(
                "Unable to delete this product."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const totalPages = Math.max(
        1,
        Math.ceil(
            products.length /
            ITEMS_PER_PAGE
        )
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage your products and pricing.
                    </p>
                </div>

                {canCreateProduct && (
                    <Button
                        type="button"
                        onClick={handleCreate}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                )}
            </div>

            {(error || actionError) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/40">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {actionError ?? error}
                    </p>
                </div>
            )}

            <Card className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <label
                            htmlFor="product-category"
                            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Category
                        </label>

                        <select
                            id="product-category"
                            value={selectedCategoryId}
                            onChange={(event) =>
                                handleCategoryChange(
                                    event.target.value
                                )
                            }
                            disabled={categoriesLoading}
                            className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:max-w-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {!loading && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {products.length}{" "}
                            {products.length === 1
                                ? "product"
                                : "products"}
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-0">
                <ProductTable
                    products={
                        paginatedProducts
                    }
                    loading={loading}
                    canEdit={
                        canEditProduct
                    }
                    canDelete={
                        canDeleteProduct
                    }
                    onEdit={handleEdit}
                    onDelete={
                        handleDeleteRequest
                    }
                />

                {!loading &&
                    products.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {(currentPage - 1) *
                                        ITEMS_PER_PAGE +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {Math.min(
                                        currentPage *
                                        ITEMS_PER_PAGE,
                                        products.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {products.length}
                                </span>
                            </p>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-2 sm:justify-end">
                                    <Button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (current) =>
                                                    Math.max(
                                                        1,
                                                        current -
                                                        1
                                                    )
                                            )
                                        }
                                        className="!bg-white !text-slate-700 !ring-1 !ring-slate-300 !shadow-none !hover:bg-slate-50 dark:!bg-slate-900 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-800"
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            {
                                                length: totalPages,
                                            },
                                            (_, index) => index + 1).map(
                                                (page) => (
                                                    <button
                                                        key={page}
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                page
                                                            )
                                                        }
                                                        className={`min-h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${currentPage ===
                                                            page
                                                            ? "bg-indigo-600 text-white"
                                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                            }`}
                                                        aria-label={`Go to page ${page}`}
                                                        aria-current={
                                                            currentPage ===
                                                                page
                                                                ? "page"
                                                                : undefined
                                                        }
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}
                                    </div>

                                    <Button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (current) =>
                                                    Math.min(
                                                        totalPages,
                                                        current +
                                                        1
                                                    )
                                            )
                                        }
                                        className="!bg-white !text-slate-700 !ring-1 !ring-slate-300 !shadow-none !hover:bg-slate-50 dark:!bg-slate-900 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-800"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
            </Card>

            <Modal
                isOpen={isFormOpen}
                title={selectedProduct ? "Edit Product" : "Create Product"}
                description={selectedProduct ? "Update the product details." : "Add a new product."}
                onClose={handleCloseForm}
                size="xl"
                className="h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-2rem)]"
            >
                <ProductForm
                    product={selectedProduct}
                    categories={categories}
                    loading={formLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                />
            </Modal>

            <ConfirmDialog
                isOpen={Boolean(
                    productToDelete
                )}
                title="Delete Product"
                message={
                    productToDelete
                        ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
                        : ""
                }
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() =>
                    !deleteLoading &&
                    setProductToDelete(null)
                }
            />
        </div>
    );
}

export default Products;