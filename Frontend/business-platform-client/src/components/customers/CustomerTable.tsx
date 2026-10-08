import {Edit,Mail,Phone,Trash2,} from "lucide-react";

import type { Customer } from "../../types/Customers/customer.types";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface CustomerTableProps {
    customers: Customer[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

function CustomerTable({
    customers,
    loading,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: CustomerTableProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading customers...
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                    No customers found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    Add your first customer to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Customer
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Contact
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Location
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {customers.map((customer) => (
                            <tr
                                key={customer.id}
                                className="transition hover:bg-slate-50"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {customer.fullName}
                                        </p>

                                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                            <Mail className="h-3.5 w-3.5" />
                                            {customer.email}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        {customer.phoneNumber}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {customer.city || customer.state ? (
                                        <>
                                            {customer.city}
                                            {customer.city && customer.state
                                                ? ", "
                                                : ""}
                                            {customer.state}
                                        </>
                                    ) : (
                                        <span className="text-slate-400">
                                            —
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <Badge
                                        variant={
                                            customer.isActive
                                                ? "success"
                                                : "neutral"
                                        }
                                    >
                                        {customer.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        {canEdit && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onEdit(customer)
                                                }
                                                className="bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
                                                title="Edit customer"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {canDelete && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(customer)
                                                }
                                                className="bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                                                title="Delete customer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CustomerTable;