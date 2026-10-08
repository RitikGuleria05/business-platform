import { useState } from "react";
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

import type { Product, CreateProductRequest, UpdateProductRequest, } from "../../types/Products/product.types";

function Products() {
    const {
        products,
        loading,
        error,
        addProduct,
        editProduct,
        removeProduct,
    } = useProducts();

    const {
        categories,
        loading: categoriesLoading,
    } = useCategories();

    const { hasPermission } = useAuth();

    const canCreateProduct = hasPermission("Product.Create");

    const canEditProduct = hasPermission("Product.Edit");

    const canDeleteProduct = hasPermission("Product.Delete");

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const [formLoading, setFormLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);

    const [actionError, setActionError] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedProduct(null);
        setActionError(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
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

    const handleSubmit = async (request: | CreateProductRequest | UpdateProductRequest) => {
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

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your products and pricing.
                    </p>
                </div>

                {canCreateProduct && (
                    <Button
                        type="button"
                        onClick={handleCreate}
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                )}
            </div>

            {/* Error */}
            {(error || actionError) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">
                        {actionError ?? error}
                    </p>
                </div>
            )}

            {/* Product Table */}
            <Card className="p-0">
                <ProductTable
                    products={products}
                    loading={loading}
                    canEdit={canEditProduct}
                    canDelete={canDeleteProduct}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                title={
                    selectedProduct
                        ? "Edit Product"
                        : "Create Product"
                }
                description={
                    selectedProduct
                        ? "Update the product details."
                        : "Add a new product."
                }
                onClose={handleCloseForm}
                maxWidth="max-w-3xl"
            >
                <ProductForm
                    product={selectedProduct}
                    categories={categories}
                    loading={
                        formLoading ||
                        categoriesLoading
                    }
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(productToDelete)}
                title="Delete Product"
                message={
                    productToDelete
                        ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
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