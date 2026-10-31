
import { Edit, Mail, Phone, Trash2, Users } from "lucide-react";

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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div className="h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="space-y-4 p-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4"
                        >
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="hidden h-6 w-16 animate-pulse rounded-md bg-slate-100 sm:block dark:bg-slate-800" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Users className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    No customers found
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Add your first customer to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Customer Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {customers.length} {customers.length === 1 ? "customer" : "customers"}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
                        <tr>
                            <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Customer
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Contact
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Location
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Status
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {customers.map((customer) => (
                            <tr
                                key={customer.id}
                                className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <td className="px-5 py-4">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        {customer.fullName}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span>{customer.email}</span>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Phone className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                                        {customer.phoneNumber}
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {customer.city || customer.state ? (
                                        <>
                                            {customer.city}
                                            {customer.city && customer.state ? ", " : ""}
                                            {customer.state}
                                        </>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500">
                                            —
                                        </span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    <Badge variant={customer.isActive ? "success" : "neutral"}>
                                        {customer.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                        {canEdit && (
                                            <Button
                                                type="button"
                                                onClick={() => onEdit(customer)}
                                                className="!bg-slate-100 !px-3 !py-2 !text-slate-700 shadow-none hover:!bg-slate-200 dark:!bg-slate-800 dark:!text-slate-200 dark:hover:!bg-slate-700"
                                                title="Edit customer"
                                                aria-label={`Edit ${customer.fullName}`}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {canDelete && (
                                            <Button
                                                type="button"
                                                onClick={() => onDelete(customer)}
                                                className="!bg-red-50 !px-3 !py-2 !text-red-600 shadow-none hover:!bg-red-100 dark:!bg-red-950/40 dark:!text-red-400 dark:hover:!bg-red-950/70"
                                                title="Delete customer"
                                                aria-label={`Delete ${customer.fullName}`}
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
