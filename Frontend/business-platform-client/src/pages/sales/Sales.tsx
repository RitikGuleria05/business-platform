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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Sales
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage sales and transactions
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={fetchSales}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
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
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <Plus size={17} />

                            New Sale
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
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