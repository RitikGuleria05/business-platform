
import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { useAuth } from "../../hooks/auth/AuthContext";
import { useCustomers } from "../../hooks/customers/useCustomers";

import type {
    Customer,
    CreateCustomerRequest,
    UpdateCustomerRequest,
} from "../../types/Customers/customer.types";

import CustomerTable from "../../components/customers/CustomerTable";
import CustomerForm from "../../components/customers/CustomerForm";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

function Customers() {
    const { hasPermission } = useAuth();

    const {
        customers,
        loading,
        error,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    } = useCustomers();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const canCreate = hasPermission("Customer.Create");
    const canEdit = hasPermission("Customer.Edit");
    const canDelete = hasPermission("Customer.Delete");

    const openCreateModal = () => {
        setSelectedCustomer(null);
        setIsFormOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setIsFormOpen(false);
        setSelectedCustomer(null);
    };

    const handleSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
        try {
            setSubmitting(true);

            if (selectedCustomer) {
                await updateCustomer(
                    selectedCustomer.id,
                    data as UpdateCustomerRequest
                );
            } else {
                await createCustomer(data as CreateCustomerRequest);
            }

            setIsFormOpen(false);
            setSelectedCustomer(null);
        } catch {
            // The hook already stores the API error.
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!customerToDelete) {
            return;
        }

        try {
            setDeleting(true);
            await deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
        } catch {
            // The hook already stores the API error.
        } finally {
            setDeleting(false);
        }
    };

    if (!hasPermission("Customer.View")) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    You do not have permission to view customers.
                </p>
            </div>
        );
    }

    const activeCustomers = customers.filter((customer) => customer.isActive);
    const inactiveCustomers = customers.filter((customer) => !customer.isActive);

    return (
        <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/50">
                        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                            Customers
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage your customers and their contact information.
                        </p>
                    </div>
                </div>

                {canCreate && (
                    <Button
                        type="button"
                        onClick={openCreateModal}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Customer
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Card className="p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Customers
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {customers.length}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
                            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Active Customers
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {activeCustomers.length}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Inactive Customers
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                {inactiveCustomers.length}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                    {error}
                </div>
            )}

            <CustomerTable
                customers={customers}
                loading={loading}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEditModal}
                onDelete={setCustomerToDelete}
            />

            <Modal
                isOpen={isFormOpen}
                title={selectedCustomer ? "Edit Customer" : "Add Customer"}
                description={
                    selectedCustomer
                        ? "Update customer information."
                        : "Add a new customer to your business."
                }
                onClose={closeFormModal}
            >
                <CustomerForm
                    customer={selectedCustomer}
                    loading={submitting}
                    onSubmit={handleSubmit}
                    onCancel={closeFormModal}
                />
            </Modal>

            <ConfirmDialog
                isOpen={Boolean(customerToDelete)}
                title="Delete Customer"
                message={
                    customerToDelete
                        ? `Are you sure you want to delete ${customerToDelete.fullName}? This action cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleting) {
                        setCustomerToDelete(null);
                    }
                }}
            />
        </div>
    );
}

export default Customers;
