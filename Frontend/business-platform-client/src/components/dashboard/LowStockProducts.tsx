import type { LowStockProduct } from "../../types/reports/reports";

interface LowStockProductsProps {
    products: LowStockProduct[];
}

function LowStockProducts({
    products,
}: LowStockProductsProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-800">
                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    Low Stock
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Products that may need restocking.
                </p>
            </div>

            {products.length === 0 ? (
                <div className="p-4 sm:p-5">
                    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-950/50">
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            No low stock products.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                                    Product
                                </th>

                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                                    SKU
                                </th>

                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                                    Stock
                                </th>

                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                                    Reorder Level
                                </th>

                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {products.map((product) => (
                                <tr
                                    key={product.productId}
                                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <td className="max-w-[220px] px-4 py-4 sm:px-5">
                                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {product.productName}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                            {product.categoryName}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-5 dark:text-slate-300">
                                        {product.sku}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 sm:px-5 dark:text-slate-100">
                                        {product.currentStock}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-5 dark:text-slate-300">
                                        {product.reorderLevel}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                            {product.stockStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default LowStockProducts;