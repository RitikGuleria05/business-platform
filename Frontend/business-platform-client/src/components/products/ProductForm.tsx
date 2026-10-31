import { useEffect, useState } from "react";
import type {
    ChangeEvent,
    FormEvent,
} from "react";

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
    const [currentStep, setCurrentStep] = useState(1);

    const isEditMode = Boolean(product);
    const totalSteps = isEditMode ? 2 : 3;

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
        setCurrentStep(1);
    }, [product]);

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
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

    const validateStep = (
        step: number
    ): boolean => {
        const newErrors: FormErrors = {};

        /*
         * STEP 1
         * Product details
         */
        if (step === 1) {
            if (!formData.name.trim()) {
                newErrors.name =
                    "Product name is required.";
            }

            if (!formData.sku.trim()) {
                newErrors.sku =
                    "SKU is required.";
            }

            if (!formData.categoryId) {
                newErrors.categoryId =
                    "Category is required.";
            }
        }

        /*
         * STEP 2
         * Pricing
         */
        if (step === 2) {
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
        }

        /*
         * STEP 3
         * Inventory only applies when creating
         * a new product.
         */
        if (
            step === 3 &&
            !isEditMode
        ) {
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

        return (
            Object.keys(newErrors)
                .length === 0
        );
    };

    const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const isValid = validateStep(currentStep);

        if (!isValid) {
            return;
        }

        setCurrentStep((current) => Math.min(current + 1, totalSteps));
    };

    const handleBack = () => {
        setErrors({});

        setCurrentStep((current) =>
            Math.max(
                current - 1,
                1
            )
        );
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        /*
         * Validate the final step.
         *
         * Previous steps have already been
         * validated while moving forward.
         */
        if (
            !validateStep(
                currentStep
            )
        ) {
            return;
        }

        if (product) {
            const request: UpdateProductRequest = {
                name: formData.name.trim(),
                sku: formData.sku.trim(),

                barcode:
                    formData.barcode.trim() ||
                    null,

                description:
                    formData.description.trim() ||
                    null,

                categoryId:
                    formData.categoryId,

                costPrice: Number(
                    formData.costPrice
                ),

                sellingPrice: Number(
                    formData.sellingPrice
                ),

                isActive:
                    formData.isActive,
            };

            await onSubmit(request);

            return;
        }

        const request: CreateProductRequest = {
            name: formData.name.trim(),
            sku: formData.sku.trim(),

            barcode:
                formData.barcode.trim() ||
                null,

            description:
                formData.description.trim() ||
                null,

            categoryId:
                formData.categoryId,

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
            (category) =>
                category.isActive
        );

    const steps = [
        {
            number: 1,
            title: "Details",
            description: "Product information",
        },
        {
            number: 2,
            title: "Pricing",
            description: "Set product prices",
        },
        ...(!isEditMode
            ? [
                {
                    number: 3,
                    title: "Inventory",
                    description: "Stock settings",
                },
            ]
            : []),
    ];

    return (
        <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="flex h-full min-h-0 flex-col"
        >
            {/* ========================================
                STEPPER
            ========================================= */}
            <div className="shrink-0 border-b border-slate-200 pb-5 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {steps[
                                currentStep - 1
                            ].title}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {
                                steps[
                                    currentStep - 1
                                ].description
                            }
                        </p>
                    </div>

                    <p className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Step {currentStep} of{" "}
                        {totalSteps}
                    </p>
                </div>

                <div className="mt-5 flex items-center">
                    {steps.map(
                        (
                            step,
                            index
                        ) => {
                            const isActive =
                                currentStep ===
                                step.number;

                            const isCompleted =
                                currentStep >
                                step.number;

                            return (
                                <div
                                    key={
                                        step.number
                                    }
                                    className="flex min-w-0 flex-1 items-center"
                                >
                                    <button
                                        type="button"
                                        disabled={
                                            loading ||
                                            (!isCompleted &&
                                                !isActive)
                                        }
                                        onClick={() => {
                                            if (
                                                isCompleted
                                            ) {
                                                setErrors(
                                                    {}
                                                );

                                                setCurrentStep(
                                                    step.number
                                                );
                                            }
                                        }}
                                        className="flex min-w-0 items-center gap-2 text-left outline-none"
                                    >
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${isActive ||
                                                isCompleted
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                                }`}
                                        >
                                            {isCompleted
                                                ? "✓"
                                                : step.number}
                                        </span>

                                        <span className="hidden min-w-0 sm:block">
                                            <span
                                                className={`block truncate text-sm font-medium ${isActive
                                                    ? "text-slate-900 dark:text-slate-100"
                                                    : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            >
                                                {
                                                    step.title
                                                }
                                            </span>

                                            <span className="mt-0.5 block truncate text-xs text-slate-400 dark:text-slate-500">
                                                {
                                                    step.description
                                                }
                                            </span>
                                        </span>
                                    </button>

                                    {index <
                                        steps.length -
                                        1 && (
                                            <div
                                                className={`mx-3 h-px flex-1 ${currentStep >
                                                    step.number
                                                    ? "bg-indigo-600"
                                                    : "bg-slate-200 dark:bg-slate-800"
                                                    }`}
                                            />
                                        )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>

            {/* ========================================
                SCROLLABLE FORM AREA
            ========================================= */}
            <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-2">
                {/* ====================================
                    STEP 1
                ==================================== */}
                {currentStep === 1 && (
                    <section>
                        <div className="mb-6">
                            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                Step 1
                            </p>

                            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                Product details
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Start with the basic information used to identify this product.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                id="name"
                                name="name"
                                label="Product Name"
                                placeholder="e.g. Wireless Keyboard"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                error={
                                    errors.name
                                }
                                disabled={
                                    loading
                                }
                            />

                            <Input
                                id="sku"
                                name="sku"
                                label="SKU"
                                placeholder="e.g. KB-001"
                                value={
                                    formData.sku
                                }
                                onChange={
                                    handleChange
                                }
                                error={
                                    errors.sku
                                }
                                disabled={
                                    loading
                                }
                            />

                            <div>
                                <label
                                    htmlFor="categoryId"
                                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Category
                                </label>

                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={
                                        formData.categoryId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        loading
                                    }
                                    className={`min-h-10 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition duration-150 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500 ${errors.categoryId
                                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500"
                                        : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700"
                                        }`}
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {activeCategories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.categoryId && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                        {
                                            errors.categoryId
                                        }
                                    </p>
                                )}
                            </div>

                            <Input
                                id="barcode"
                                name="barcode"
                                label="Barcode (Optional)"
                                placeholder="Enter barcode"
                                value={
                                    formData.barcode
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    loading
                                }
                            />

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Description{" "}
                                    <span className="font-normal text-slate-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder="Add a short description of this product..."
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* ====================================
                    STEP 2
                ==================================== */}
                {currentStep === 2 && (
                    <section>
                        <div className="mb-6">
                            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                Step 2
                            </p>

                            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                Product pricing
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Set the cost and selling price for this product.
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
                                value={
                                    formData.costPrice
                                }
                                onChange={
                                    handleChange
                                }
                                error={
                                    errors.costPrice
                                }
                                disabled={
                                    loading
                                }
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
                                onChange={
                                    handleChange
                                }
                                error={
                                    errors.sellingPrice
                                }
                                disabled={
                                    loading
                                }
                            />
                        </div>

                        <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                Pricing information
                            </p>

                            <p className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                                Cost price is what your business pays for the product. Selling price is the price charged to customers.
                            </p>
                        </div>
                    </section>
                )}

                {/* ====================================
                    STEP 3 - CREATE
                ==================================== */}
                {currentStep === 3 &&
                    !isEditMode && (
                        <section>
                            <div className="mb-6">
                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                    Step 3
                                </p>

                                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                    Initial inventory
                                </h3>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Set the starting stock and inventory thresholds.
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
                                    onChange={
                                        handleChange
                                    }
                                    error={
                                        errors.initialStock
                                    }
                                    disabled={
                                        loading
                                    }
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
                                    onChange={
                                        handleChange
                                    }
                                    error={
                                        errors.minimumStock
                                    }
                                    disabled={
                                        loading
                                    }
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
                                    onChange={
                                        handleChange
                                    }
                                    error={
                                        errors.maximumStock
                                    }
                                    disabled={
                                        loading
                                    }
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
                                    onChange={
                                        handleChange
                                    }
                                    error={
                                        errors.reorderLevel
                                    }
                                    disabled={
                                        loading
                                    }
                                />
                            </div>

                            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    Inventory thresholds
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Set the minimum and maximum stock levels your business wants to maintain. The reorder level helps identify when stock should be replenished.
                                </p>
                            </div>
                        </section>
                    )}
            </div>

            {/* ========================================
                FOOTER
            ========================================= */}
            <div className="shrink-0 border-t border-slate-200 bg-white pt-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        onClick={
                            currentStep === 1
                                ? onCancel
                                : handleBack
                        }
                        disabled={loading}
                        className="!min-h-10 !w-full !bg-white !text-slate-700 !ring-1 !ring-slate-300 !shadow-none !hover:bg-slate-50 sm:!w-auto dark:!bg-slate-900 dark:!text-slate-200 dark:!ring-slate-700 dark:!hover:bg-slate-800"
                    >
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </Button>

                    {currentStep < totalSteps ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={loading}
                            className="!min-h-10 !w-full !bg-indigo-600 !text-white !shadow-sm !hover:bg-indigo-700 sm:!w-auto"
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="!min-h-10 !w-full !bg-indigo-600 !text-white !shadow-sm !hover:bg-indigo-700 sm:!w-auto"
                        >
                            {isEditMode
                                ? "Update Product"
                                : "Create Product"}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}

export default ProductForm;