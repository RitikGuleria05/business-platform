import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Category } from "../../types/Categories/category.types.ts";

import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
} from "../../types/Products/product.types";

import Input from "../ui/Input";
import Button from "../ui/Button";

interface ProductFormProps {
    product: Product | null;
    categories: Category[];
    loading?: boolean;
    onSubmit: (
        request:
            | CreateProductRequest
            | UpdateProductRequest
    ) => Promise<void>;
    onCancel: () => void;
}

interface FormData {
    name: string;
    sku: string;
    barcode: string;
    categoryId: string;
    description: string;

    costPrice: string;
    sellingPrice: string;

    initialStock: string;
    minimumStock: string;
    maximumStock: string;
    reorderLevel: string;

    isActive: boolean;
}

interface FormErrors {
    name?: string;
    sku?: string;
    categoryId?: string;
    costPrice?: string;
    sellingPrice?: string;
    initialStock?: string;
    minimumStock?: string;
    maximumStock?: string;
    reorderLevel?: string;
}

function ProductForm({
    product,
    categories,
    loading = false,
    onSubmit,
    onCancel,
}: ProductFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        sku: "",
        barcode: "",
        categoryId: "",
        description: "",

        costPrice: "",
        sellingPrice: "",

        initialStock: "",
        minimumStock: "",
        maximumStock: "",
        reorderLevel: "",

        isActive: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const isEditMode = Boolean(product);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                barcode: product.barcode ?? "",
                categoryId: product.categoryId,
                description: "",

                costPrice: String(product.costPrice),
                sellingPrice: String(product.sellingPrice),

                initialStock: "",
                minimumStock: "",
                maximumStock: "",
                reorderLevel: "",

                isActive: product.isActive,
            });
        } else {
            setFormData({
                name: "",
                sku: "",
                barcode: "",
                categoryId: "",
                description: "",

                costPrice: "",
                sellingPrice: "",

                initialStock: "",
                minimumStock: "",
                maximumStock: "",
                reorderLevel: "",

                isActive: true,
            });
        }

        setErrors({});
    }, [product]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;

        if (
            target instanceof HTMLInputElement &&
            target.type === "checkbox"
        ) {
            setFormData((current) => ({
                ...current,
                [target.name]: target.checked,
            }));

            return;
        }

        setFormData((current) => ({
            ...current,
            [target.name]: target.value,
        }));

        setErrors((current) => ({
            ...current,
            [target.name]: undefined,
        }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name =
                "Product name is required.";
        }

        if (!formData.sku.trim()) {
            newErrors.sku = "SKU is required.";
        }

        if (!formData.categoryId) {
            newErrors.categoryId =
                "Category is required.";
        }

        const costPrice = Number(
            formData.costPrice
        );

        const sellingPrice = Number(
            formData.sellingPrice
        );

        if (
            formData.costPrice === "" ||
            Number.isNaN(costPrice) ||
            costPrice < 0
        ) {
            newErrors.costPrice =
                "Enter a valid cost price.";
        }

        if (
            formData.sellingPrice === "" ||
            Number.isNaN(sellingPrice) ||
            sellingPrice < 0
        ) {
            newErrors.sellingPrice =
                "Enter a valid selling price.";
        }

        if (!isEditMode) {
            const initialStock = Number(
                formData.initialStock
            );

            const minimumStock = Number(
                formData.minimumStock
            );

            const maximumStock = Number(
                formData.maximumStock
            );

            const reorderLevel = Number(
                formData.reorderLevel
            );

            if (
                formData.initialStock === "" ||
                Number.isNaN(initialStock) ||
                initialStock < 0
            ) {
                newErrors.initialStock =
                    "Enter a valid initial stock.";
            }

            if (
                formData.minimumStock === "" ||
                Number.isNaN(minimumStock) ||
                minimumStock < 0
            ) {
                newErrors.minimumStock =
                    "Enter a valid minimum stock.";
            }

            if (
                formData.maximumStock === "" ||
                Number.isNaN(maximumStock) ||
                maximumStock < 0
            ) {
                newErrors.maximumStock =
                    "Enter a valid maximum stock.";
            }

            if (
                formData.reorderLevel === "" ||
                Number.isNaN(reorderLevel) ||
                reorderLevel < 0
            ) {
                newErrors.reorderLevel =
                    "Enter a valid reorder level.";
            }

            if (
                !Number.isNaN(minimumStock) &&
                !Number.isNaN(maximumStock) &&
                maximumStock < minimumStock
            ) {
                newErrors.maximumStock =
                    "Maximum stock must be greater than or equal to minimum stock.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        if (product) {
            const request: UpdateProductRequest = {
                name: formData.name.trim(),
                sku: formData.sku.trim(),

                barcode:
                    formData.barcode.trim() || null,

                description:
                    formData.description.trim() || null,

                categoryId: formData.categoryId,

                costPrice: Number(
                    formData.costPrice
                ),

                sellingPrice: Number(
                    formData.sellingPrice
                ),

                isActive: formData.isActive,
            };

            await onSubmit(request);

            return;
        }

        const request: CreateProductRequest = {
            name: formData.name.trim(),
            sku: formData.sku.trim(),

            barcode:
                formData.barcode.trim() || null,

            description:
                formData.description.trim() || null,

            categoryId: formData.categoryId,

            costPrice: Number(
                formData.costPrice
            ),

            sellingPrice: Number(
                formData.sellingPrice
            ),

            initialStock: Number(
                formData.initialStock
            ),

            minimumStock: Number(
                formData.minimumStock
            ),

            maximumStock: Number(
                formData.maximumStock
            ),

            reorderLevel: Number(
                formData.reorderLevel
            ),
        };

        await onSubmit(request);
    };

    const activeCategories =
        categories.filter(
            (category) => category.isActive
        );

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {/* ================================
                BASIC INFORMATION
            ================================= */}
            <section>
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Basic Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Enter the basic details of your product.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                        id="name"
                        name="name"
                        label="Product Name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        disabled={loading}
                    />

                    <Input
                        id="sku"
                        name="sku"
                        label="SKU"
                        placeholder="e.g. PROD-001"
                        value={formData.sku}
                        onChange={handleChange}
                        error={errors.sku}
                        disabled={loading}
                    />

                    <Input
                        id="barcode"
                        name="barcode"
                        label="Barcode"
                        placeholder="Enter barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <div>
                        <label
                            htmlFor="categoryId"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Category
                        </label>

                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            disabled={loading}
                            className={`
                                w-full
                                rounded-lg
                                border
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                disabled:cursor-not-allowed
                                disabled:bg-slate-100
                                ${errors.categoryId
                                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                }
                            `}
                        >
                            <option value="">
                                Select category
                            </option>

                            {activeCategories.map(
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

                        {errors.categoryId && (
                            <p className="mt-1.5 text-xs text-red-600">
                                {errors.categoryId}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label
                            htmlFor="description"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Add a short description..."
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                            disabled={loading}
                            className="
                                w-full
                                resize-none
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-indigo-500
                                focus:ring-2
                                focus:ring-indigo-100
                                disabled:cursor-not-allowed
                                disabled:bg-slate-100
                            "
                        />
                    </div>
                </div>
            </section>

            {/* ================================
                PRICING
            ================================= */}
            <section className="border-t border-slate-100 pt-7">
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Pricing
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Set the cost and selling price.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                        id="costPrice"
                        name="costPrice"
                        type="number"
                        label="Cost Price"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={handleChange}
                        error={errors.costPrice}
                        disabled={loading}
                    />

                    <Input
                        id="sellingPrice"
                        name="sellingPrice"
                        type="number"
                        label="Selling Price"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={
                            formData.sellingPrice
                        }
                        onChange={handleChange}
                        error={
                            errors.sellingPrice
                        }
                        disabled={loading}
                    />
                </div>
            </section>

            {/* ================================
                INITIAL INVENTORY
            ================================= */}
            {!isEditMode && (
                <section className="border-t border-slate-100 pt-7">
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Initial Inventory
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Configure the initial stock and inventory limits.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input
                            id="initialStock"
                            name="initialStock"
                            type="number"
                            label="Initial Stock"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={
                                formData.initialStock
                            }
                            onChange={handleChange}
                            error={
                                errors.initialStock
                            }
                            disabled={loading}
                        />

                        <Input
                            id="minimumStock"
                            name="minimumStock"
                            type="number"
                            label="Minimum Stock"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={
                                formData.minimumStock
                            }
                            onChange={handleChange}
                            error={
                                errors.minimumStock
                            }
                            disabled={loading}
                        />

                        <Input
                            id="maximumStock"
                            name="maximumStock"
                            type="number"
                            label="Maximum Stock"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={
                                formData.maximumStock
                            }
                            onChange={handleChange}
                            error={
                                errors.maximumStock
                            }
                            disabled={loading}
                        />

                        <Input
                            id="reorderLevel"
                            name="reorderLevel"
                            type="number"
                            label="Reorder Level"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={
                                formData.reorderLevel
                            }
                            onChange={handleChange}
                            error={
                                errors.reorderLevel
                            }
                            disabled={loading}
                        />
                    </div>
                </section>
            )}

            {/* ================================
                PRODUCT STATUS
            ================================= */}
            {isEditMode && (
                <section className="border-t border-slate-100 pt-7">
                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Product Status
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Control whether this product is active.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={
                                formData.isActive
                            }
                            onChange={handleChange}
                            disabled={loading}
                            className="
                                mt-0.5
                                h-4
                                w-4
                                rounded
                                border-slate-300
                                text-indigo-600
                                focus:ring-indigo-500
                                disabled:cursor-not-allowed
                            "
                        />

                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                Active Product
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Inactive products will not appear
                                in the normal product list.
                            </p>
                        </div>
                    </label>
                </section>
            )}

            {/* ================================
                ACTIONS
            ================================= */}
            <div
                className="
                    sticky
                    bottom-0
                    -mx-6
                    -mb-6
                    flex
                    justify-end
                    gap-3
                    border-t
                    border-slate-200
                    bg-white
                    px-6
                    py-4
                "
            >
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={loading}
                >
                    {isEditMode
                        ? "Update Product"
                        : "Create Product"}
                </Button>
            </div>
        </form>
    );
}

export default ProductForm;