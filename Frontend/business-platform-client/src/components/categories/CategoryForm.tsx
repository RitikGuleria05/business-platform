import { useEffect, useState, type FormEvent } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import type {Category,CreateCategoryRequest,UpdateCategoryRequest} from "../../types/Categories/category.types.ts";

interface CategoryFormProps {
    category?: Category | null;
    onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

function CategoryForm({
    category,
    onSubmit,
    onCancel,
    loading = false,
    error = null,
}: CategoryFormProps) {
    const isEditMode = Boolean(category);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description ?? "");
            setIsActive(category.isActive);
        } else {
            setName("");
            setDescription("");
            setIsActive(true);
        }

        setValidationError("");
    }, [category]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setValidationError("Category name is required.");
            return;
        }

        setValidationError("");

        if (isEditMode) {
            await onSubmit({
                name: trimmedName,
                description: description.trim(),
                isActive,
            });
        } else {
            await onSubmit({
                name: trimmedName,
                description: description.trim(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
            <div className="space-y-5 p-4 sm:p-5">
                {(validationError || error) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/70 dark:bg-red-950/40">
                        <p className="text-sm leading-5 text-red-700 dark:text-red-300">
                            {validationError || error}
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        htmlFor="category-name"
                        className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
                    >
                        Category Name
                    </label>

                    <Input
                        id="category-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter category name"
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="category-description"
                        className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
                    >
                        Description
                    </label>

                    <textarea
                        id="category-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        placeholder="Enter category description"
                        disabled={loading}
                        rows={4}
                        className="min-h-[112px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                    />
                </div>

                {isEditMode && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) =>
                                setIsActive(event.target.checked)
                            }
                            disabled={loading}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900"
                        />

                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Active category
                        </span>
                    </label>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-5 dark:border-slate-800 dark:bg-slate-950/40">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="!w-full !bg-white !text-slate-700 !ring-1 !ring-slate-300 !hover:bg-slate-50 dark:!bg-slate-800 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-700 sm:!w-auto"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={loading}
                    className="!w-full sm:!w-auto"
                >
                    {isEditMode ? "Update Category" : "Create Category"}
                </Button>
            </div>
        </form>
    );
}

export default CategoryForm;