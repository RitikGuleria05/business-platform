import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import SaleTable from "../../components/sales/SaleTable";
import SaleForm from "../../components/sales/SaleForm";
import SaleReturnForm from "../../components/sales/SaleReturnForm";
import SaleDetails from "./SaleDetails";

import { useSales } from "../../hooks/sales/useSales";
import { useCustomers } from "../../hooks/customers/useCustomers";
import { useProducts } from "../../hooks/products/useProducts";
import { useAuth } from "../../hooks/auth/AuthContext";

import type {
    CreateSaleRequest,
    SaleResponse,
} from "../../types/Sales/sale.types";

export default function Sales() {
    const {
        sales,
        loading: salesLoading,
        error: salesError,
        fetchSales,
        fetchSaleById,
        addSale,
        cancel,
    } = useSales();

    const {
        customers,
        loading: customersLoading,
        error: customersError,
    } = useCustomers();

    const {
        products,
        loading: productsLoading,
        error: productsError,
    } = useProducts();


    const { hasPermission } = useAuth();

    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [showReturnForm, setShowReturnForm] = useState(false);

    const handleView = (id: string) => {
        setSelectedSaleId(id);
    };

    const handleCancel = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this sale?"
        );

        if (!confirmed) {
            return;
        }

        await cancel(id);
    };

    const handleCreateSale = async (data: CreateSaleRequest) => {
        await addSale(data);

        setShowForm(false);
    };

    const handleReturn = async (sale: SaleResponse) => {
        try {
            const fullSale = await fetchSaleById(sale.id);

            setSelectedSale(fullSale);
            setShowReturnForm(true);
        } catch (error) {
            console.error("Failed to load sale details:", error);
        }
    };

    const handleReturnSuccess = () => {
        setShowReturnForm(false);
        setSelectedSale(null);
    };

    /* =========================
       RETURN FORM
    ========================= */

    if (
        showReturnForm &&
        selectedSale
    ) {
        return (
            <SaleReturnForm
                sale={selectedSale}
                onSuccess={handleReturnSuccess}
                onCancel={() => {
                    setShowReturnForm(false);
                    setSelectedSale(null);
                }}
            />
        );
    }

    /* =========================
       SALE DETAILS
    ========================= */

    if (selectedSaleId) {
        return (
            <SaleDetails
                saleId={selectedSaleId}
                onBack={() =>
                    setSelectedSaleId(null)
                }
                onReturn={handleReturn}
            />
        );
    }

    /* =========================
       SALE FORM
    ========================= */

    if (showForm) {
        return (
            <SaleForm
                customers={customers}
                products={products}
                onSubmit={handleCreateSale}
                onCancel={() =>
                    setShowForm(false)
                }
            />
        );
    }

    const loading =
        salesLoading ||
        customersLoading ||
        productsLoading;

    const error =
        salesError ||
        customersError ||
        productsError;

    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Sales
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage sales and transactions
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <button
                        type="button"
                        onClick={fetchSales}
                        disabled={loading}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <RefreshCw size={17} />

                        Refresh
                    </button>

                    {hasPermission("sales.create") && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowForm(true)
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
                        >
                            <Plus size={17} />

                            New Sale
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Table */}

            <SaleTable
                sales={sales}
                loading={salesLoading}
                onView={handleView}
                onCancel={handleCancel}
                onReturn={handleReturn}
            />
        </div>
    );
}
