import { useState } from "react";
import { Plus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm";
import { useCategories } from "../../hooks/categories/useCategories.ts";
import type {Category,CreateCategoryRequest,UpdateCategoryRequest} from "../../types/Categories/category.types.ts";
import { useAuth } from "../../hooks/auth/useAuth";

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

    // const canViewCategories = hasPermission("Category.View");
    const canCreateCategory = hasPermission("Category.Create");
    const canEditCategory = hasPermission("Category.Edit");
    const canDeleteCategory = hasPermission("Category.Delete");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<Category | null>(null);

    const [categoryToDelete, setCategoryToDelete] =
        useState<Category | null>(null);

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
        setActionError(null);
    };

    const handleSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
        try {
            setFormLoading(true);
            setActionError(null);

            if (selectedCategory) {
                await editCategory(selectedCategory.id, data as UpdateCategoryRequest);
            } else {
                await addCategory(data as CreateCategoryRequest);
            }

            setIsFormOpen(false);
            setSelectedCategory(null);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteRequest = (category: Category) => {
        setCategoryToDelete(category);
        setActionError(null);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        try {
            setDeleteLoading(true);
            setActionError(null);

            await removeCategory(categoryToDelete.id);

            setCategoryToDelete(null);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-w-0 space-y-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

            {(error || actionError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/70 dark:bg-red-950/40">
                    <p className="text-sm leading-5 text-red-700 dark:text-red-300">
                        {actionError ?? error}
                    </p>
                </div>
            )}

            <Card className="!overflow-hidden !p-0">
                <CategoryTable
                    categories={categories}
                    loading={loading}
                    canEdit={canEditCategory}
                    canDelete={canDeleteCategory}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            </Card>

            <Modal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                title={
                    selectedCategory
                        ? "Edit Category"
                        : "Create Category"
                }
                description={
                    selectedCategory
                        ? "Update the category information."
                        : "Add a new product category."
                }
            >
                <CategoryForm
                    category={selectedCategory}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                    loading={formLoading}
                    error={actionError}
                />
            </Modal>

            <ConfirmDialog
                isOpen={Boolean(categoryToDelete)}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleteLoading) {
                        setCategoryToDelete(null);
                    }
                }}
                loading={deleteLoading}
            />
        </div>
    );
}

export default Categories;