import { useEffect, useState } from "react";
import type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "../../types/Categories/category.types.ts";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input.tsx";

interface CategoryFormProps {
    category?: Category | null;
    loading?: boolean;
    onSubmit: (
        request: CreateCategoryRequest | UpdateCategoryRequest
    ) => Promise<void>;
    onCancel: () => void;
}

function CategoryForm({
    category,
    loading = false,
    onSubmit,
    onCancel,
}: CategoryFormProps) {
    const isEditMode = Boolean(category);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [nameError, setNameError] = useState("");

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

        setNameError("");
    }, [category]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError("Category name is required.");
            return;
        }

        setNameError("");

        if (isEditMode) {
            await onSubmit({
                name: trimmedName,
                description: description.trim() || null,
                isActive,
            });
        } else {
            await onSubmit({
                name: trimmedName,
                description: description.trim() || null,
            });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* Category Name */}
            <Input
                id="category-name"
                label="Category Name"
                value={name}
                onChange={(event) =>
                    setName(event.target.value)
                }
                placeholder="Enter category name"
                error={nameError}
                disabled={loading}
            />

            {/* Description */}
            <div>
                <label
                    htmlFor="category-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
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
                    className="
                        min-h-[110px]
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-slate-300
                        bg-white
                        px-3
                        py-2.5
                        text-sm
                        leading-5
                        text-slate-900
                        outline-none
                        transition
                        duration-150
                        placeholder:text-slate-400
                        hover:border-slate-400
                        focus:border-indigo-500
                        focus:ring-2
                        focus:ring-indigo-500/20
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                        disabled:text-slate-400
                    "
                />
            </div>

            {/* Active */}
            {isEditMode && (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 transition-colors hover:bg-slate-100">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) =>
                            setIsActive(event.target.checked)
                        }
                        disabled={loading}
                        className="
                            h-4
                            w-4
                            shrink-0
                            rounded
                            border-slate-300
                            text-indigo-600
                            focus:ring-2
                            focus:ring-indigo-500/20
                            disabled:cursor-not-allowed
                        "
                    />

                    <span className="text-sm font-medium text-slate-700">
                        Active
                    </span>
                </label>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={loading}
                    className="w-full sm:w-auto"
                >
                    {isEditMode
                        ? "Update Category"
                        : "Create Category"}
                </Button>
            </div>
        </form>
    );
}

export default CategoryForm;