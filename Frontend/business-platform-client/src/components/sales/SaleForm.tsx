import {
    ArrowLeft,
    FileText,
    Package,
    Plus,
    ShoppingCart,
    Trash2,
    User,
} from "lucide-react";
import { useState } from "react";

import PaymentSection from "./PaymentSection";

import type {
    CreateSaleRequest,
    PaymentRequest,
    SaleItemRequest,
} from "../../types/Sales/sale.types";

import type { Customer } from "../../types/Customers/customer.types";
import type { Product } from "../../types/Products/product.types";

interface SaleFormProps {
    customers: Customer[];
    products: Product[];
    onSubmit: (data: CreateSaleRequest) => Promise<void>;
    onCancel: () => void;
}

interface SaleFormItem extends SaleItemRequest {
    productName: string;
    unitPrice: number;
    stock: number;
}

export default function SaleForm({
    customers,
    products,
    onSubmit,
    onCancel,
}: SaleFormProps) {
    const [customerId, setCustomerId] = useState("");
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [remarks, setRemarks] = useState("");

    const [items, setItems] = useState<SaleFormItem[]>([]);
    const [payments, setPayments] = useState<PaymentRequest[]>([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /*
     * -----------------------------------------
     * Calculations
     * -----------------------------------------
     */

    const subtotal = items.reduce((total, item) => {
        const itemSubtotal = item.unitPrice * item.quantity;
        return total + itemSubtotal - item.discount;
    }, 0);

    const grandTotal = Math.max(
        0,
        subtotal - discount + tax
    );

    const paidAmount = payments.reduce(
        (total, payment) => total + payment.amount,
        0
    );

    const remainingAmount = Math.max(
        0,
        grandTotal - paidAmount
    );

    /*
     * -----------------------------------------
     * Product handling
     * -----------------------------------------
     */

    const addProduct = (productId: string) => {
        const product = products.find(
            (item) => item.id === productId
        );

        if (!product || !product.isActive) return;

        const existingItem = items.find(
            (item) => item.productId === productId
        );

        if (existingItem) {
            if (existingItem.quantity >= existingItem.stock) {
                return;
            }

            setItems((previous) =>
                previous.map((item) =>
                    item.productId === productId
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                )
            );

            return;
        }

        setItems((previous) => [
            ...previous,
            {
                productId: product.id,
                productName: product.name,
                unitPrice: product.sellingPrice,
                quantity: 1,
                discount: 0,
                stock: product.quantityInStock,
            },
        ]);
    };

    const removeItem = (productId: string) => {
        setItems((previous) =>
            previous.filter(
                (item) => item.productId !== productId
            )
        );
    };

    const updateQuantity = (
        productId: string,
        quantity: number
    ) => {
        setItems((previous) =>
            previous.map((item) => {
                if (item.productId !== productId) {
                    return item;
                }

                return {
                    ...item,
                    quantity: Math.max(
                        1,
                        Math.min(quantity, item.stock)
                    ),
                };
            })
        );
    };

    const updateItemDiscount = (
        productId: string,
        value: number
    ) => {
        setItems((previous) =>
            previous.map((item) => {
                if (item.productId !== productId) {
                    return item;
                }

                const itemSubtotal =
                    item.unitPrice * item.quantity;

                return {
                    ...item,
                    discount: Math.max(
                        0,
                        Math.min(value, itemSubtotal)
                    ),
                };
            })
        );
    };

    /*
     * -----------------------------------------
     * Submit
     * -----------------------------------------
     */

    const handleSubmit = async () => {
        setError(null);

        if (!customerId) {
            setError("Please select a customer.");
            return;
        }

        if (items.length === 0) {
            setError("Please add at least one product.");
            return;
        }

        if (payments.length === 0) {
            setError("Please add at least one payment.");
            return;
        }

        if (paidAmount > grandTotal) {
            setError("Payment amount cannot exceed the sale total.");
            return;
        }

        try {
            setSaving(true);

            const request: CreateSaleRequest = {
                customerId,
                discount,
                tax,
                remarks: remarks.trim() || null,
                items: items.map(
                    (item): SaleItemRequest => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        discount: item.discount,
                    })
                ),
                payments,
            };

            await onSubmit(request);
        } catch {
            setError("Failed to create sale.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Create Sale
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Create a new customer sale and record payment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                {/* Left */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                <User className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Customer
                                </h2>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Select the customer for this sale
                                </p>
                            </div>
                        </div>

                        <div className="p-5">
                            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                Customer
                            </label>

                            <select
                                value={customerId}
                                onChange={(e) =>
                                    setCustomerId(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value="">
                                    Select customer
                                </option>

                                {customers
                                    .filter((customer) => customer.isActive)
                                    .map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.fullName}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Products
                                    </h2>

                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Add products to this sale
                                    </p>
                                </div>
                            </div>

                            <select
                                value=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addProduct(e.target.value);
                                    }
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                            >
                                <option value="">
                                    + Add Product
                                </option>

                                {products
                                    .filter(
                                        (product) =>
                                            product.isActive &&
                                            product.quantityInStock > 0
                                    )
                                    .map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name} — ₹
                                            {product.sellingPrice.toFixed(
                                                2
                                            )}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="p-5">
                            {items.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/60">
                                    <Package className="mx-auto h-9 w-9 text-slate-400 dark:text-slate-500" />

                                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                        No products added
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Select a product above to add it
                                        to the sale.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item) => {
                                        const itemSubtotal =
                                            item.unitPrice *
                                            item.quantity;

                                        const itemTotal =
                                            itemSubtotal -
                                            item.discount;

                                        return (
                                            <div
                                                key={item.productId}
                                                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                                    {/* Product */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            {
                                                                item.productName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                            ₹
                                                            {item.unitPrice.toFixed(
                                                                2
                                                            )}{" "}
                                                            per unit ·{" "}
                                                            {
                                                                item.stock
                                                            }{" "}
                                                            in stock
                                                        </p>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="w-full lg:w-28">
                                                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            Quantity
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={
                                                                item.stock
                                                            }
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateQuantity(
                                                                    item.productId,
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                        />
                                                    </div>

                                                    {/* Discount */}
                                                    <div className="w-full lg:w-32">
                                                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            Discount
                                                        </label>

                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                                                                ₹
                                                            </span>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    item.discount
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateItemDiscount(
                                                                        item.productId,
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Total */}
                                                    <div className="w-full lg:w-32">
                                                        <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            Total
                                                        </p>

                                                        <p className="py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            ₹
                                                            {itemTotal.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.productId
                                                            )
                                                        }
                                                        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 text-xs font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 lg:w-10"
                                                        title="Remove product"
                                                    >
                                                        <Trash2 className="h-4 w-4" />

                                                        <span className="lg:hidden">
                                                            Remove
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                <FileText className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Additional Details
                                </h2>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Add discount, tax and remarks
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Overall Discount
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) =>
                                            setDiscount(
                                                Math.max(
                                                    0,
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Tax
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tax}
                                        onChange={(e) =>
                                            setTax(
                                                Math.max(
                                                    0,
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Remarks
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(e) =>
                                        setRemarks(e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Optional remarks..."
                                    className="w-full resize-none rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <PaymentSection
                        payments={payments}
                        onChange={setPayments}
                        grandTotal={grandTotal}
                    />
                </div>

                {/* Right Summary */}
                <div className="xl:sticky xl:top-6 xl:self-start">
                    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Sale Summary
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Review the sale before creating it.
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Items
                                </span>

                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {items.length}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Subtotal
                                </span>

                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Discount
                                </span>

                                <span className="font-medium text-red-600 dark:text-red-400">
                                    -₹{discount.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">
                                    Tax
                                </span>

                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    ₹{tax.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        Grand Total
                                    </span>

                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{grandTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Paid
                                    </span>

                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                        ₹{paidAmount.toFixed(2)}
                                    </span>
                                </div>

                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Remaining
                                    </span>

                                    <span
                                        className={`font-semibold ${remainingAmount > 0
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-emerald-600 dark:text-emerald-400"
                                            }`}
                                    >
                                        ₹
                                        {remainingAmount.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-200 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={saving}
                                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />

                                    {saving
                                        ? "Creating..."
                                        : "Create Sale"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
