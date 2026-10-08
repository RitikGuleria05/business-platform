import type { TopProduct } from "../../types/reports/reports";

interface TopProductsProps {
    products: TopProduct[];
}

function TopProducts({
    products,
}: TopProductsProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-800">
                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    Top Products
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Best-selling products by quantity.
                </p>
            </div>

            <div className="p-4 sm:p-5">
                {products.length === 0 ? (
                    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-950/50">
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            No product sales available.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {products.map((product) => (
                            <div
                                key={product.productId}
                                className="flex min-w-0 items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {product.productName}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {product.quantitySold} units sold
                                    </p>
                                </div>

                                <p className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    ₹
                                    {product.revenue.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default TopProducts;