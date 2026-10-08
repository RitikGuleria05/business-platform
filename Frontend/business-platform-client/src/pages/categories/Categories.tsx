import { useState } from "react";
import { Plus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm.tsx";
import { useCategories } from "../../hooks/categories/useCategories";
import type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "../../types/Categories/category.types.ts";
import { useAuth } from "../../hooks/auth/AuthContext.tsx";

function Categories() {
    const {
        categories,
        loading,
        error,
        addCategory,
        editCategory,
        removeCategory,
    } = useCategories();

    const { hasPermission } = useAuth();

    const canViewCategories = hasPermission("Category.View");

    const canCreateCategory = hasPermission("Category.Create");

    const canEditCategory =  hasPermission("Category.Edit");

    const canDeleteCategory = hasPermission("Category.Delete");

    const [isFormOpen, setIsFormOpen] =  useState(false);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const [formLoading, setFormLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);

    const [actionError, setActionError] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedCategory(null);
        setActionError(null);
        setIsFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setActionError(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        if (formLoading) {
            return;
        }

        setIsFormOpen(false);
        setSelectedCategory(null);
    };

    const handleSubmit = async (request: | CreateCategoryRequest | UpdateCategoryRequest) => {
        try {
            setFormLoading(true);
            setActionError(null);

            if (selectedCategory) {
                await editCategory(
                    selectedCategory.id,
                    request as UpdateCategoryRequest
                );
            } else {
                await addCategory(
                    request as CreateCategoryRequest
                );
            }

            setIsFormOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            // The hook already stores the API error.
            // We keep the modal open so the user can correct/retry.
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteRequest = (category: Category) => {
        setActionError(null);
        setCategoryToDelete(category);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        try {
            setDeleteLoading(true);
            setActionError(null);

            await removeCategory(
                categoryToDelete.id
            );

            setCategoryToDelete(null);
        } catch (error) {
            setActionError(
                "Unable to delete this category."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-w-0 space-y-6">
            {/* Page Header */}
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage product categories.
                    </p>
                </div>

                {canCreateCategory && (
                    <Button
                        type="button"
                        onClick={handleCreate}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Button>
                )}
            </div>

            {/* Error */}
            {(error || actionError) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-5 text-red-700">
                        {actionError ?? error}
                    </p>
                </div>
            )}

            {/* Categories */}
            <Card className="min-w-0 overflow-hidden p-0">
                <CategoryTable
                    categories={categories}
                    loading={loading}
                    canEdit={canEditCategory}
                    canDelete={canDeleteCategory}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                title={
                    selectedCategory
                        ? "Edit Category"
                        : "Create Category"
                }
                description={
                    selectedCategory
                        ? "Update the category details."
                        : "Add a new product category."
                }
                onClose={handleCloseForm}
            >
                <CategoryForm
                    category={selectedCategory}
                    loading={formLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(categoryToDelete)}
                title="Delete Category"
                message={
                    categoryToDelete
                        ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() =>
                    !deleteLoading &&
                    setCategoryToDelete(null)
                }
            />
        </div>
    );
}

export default Categories;