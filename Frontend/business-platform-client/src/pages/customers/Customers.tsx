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
    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [customerToDelete, setCustomerToDelete] =
        useState<Customer | null>(null);

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

    const handleSubmit = async (
        data:
            | CreateCustomerRequest
            | UpdateCustomerRequest
    ) => {
        try {
            setSubmitting(true);

            if (selectedCustomer) {
                await updateCustomer(
                    selectedCustomer.id,
                    data as UpdateCustomerRequest
                );
            } else {
                await createCustomer(
                    data as CreateCustomerRequest
                );
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
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-medium text-slate-900">
                    You do not have permission to view customers.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Customers
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your customers and their contact information.
                            </p>
                        </div>
                    </div>
                </div>

                {canCreate && (
                    <Button
                        type="button"
                        onClick={openCreateModal}
                    >
                        <Plus className="h-4 w-4" />
                        Add Customer
                    </Button>
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Total Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {customers.length}
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Active Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {
                            customers.filter(
                                (customer) =>
                                    customer.isActive
                            ).length
                        }
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm text-slate-500">
                        Inactive Customers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {
                            customers.filter(
                                (customer) =>
                                    !customer.isActive
                            ).length
                        }
                    </p>
                </Card>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Table */}
            <CustomerTable
                customers={customers}
                loading={loading}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEditModal}
                onDelete={setCustomerToDelete}
            />

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                title={
                    selectedCustomer
                        ? "Edit Customer"
                        : "Add Customer"
                }
                description={
                    selectedCustomer
                        ? "Update customer information."
                        : "Add a new customer to your business."
                }
                onClose={closeFormModal}
                maxWidth="max-w-2xl"
            >
                <CustomerForm
                    customer={selectedCustomer}
                    loading={submitting}
                    onSubmit={handleSubmit}
                    onCancel={closeFormModal}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(customerToDelete)}
                title="Delete Customer"
                message={
                    customerToDelete
                        ? `Are you sure you want to delete ${customerToDelete.fullName}? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() =>
                    deleting
                        ? undefined
                        : setCustomerToDelete(null)
                }
            />
        </div>
    );
}

export default Customers;