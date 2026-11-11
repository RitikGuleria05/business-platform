
import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useRoles } from "../../hooks/roles/useRoles";
import { AssignPermissionsModal } from "../../components/roles/AssignPermissionsModal";
import type { Role } from "../../types/roles/role";

export default function RolesPage() {
    const {
        roles,
        allPermissions,
        loading,
        error,
        createRole,
        deleteRole,
        getRolePermissions,
        assignPermissions,
    } = useRoles();

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRoleName.trim()) return;

        await createRole({
            name: newRoleName.trim(),
            description: newRoleDesc.trim() || undefined,
        });

        setNewRoleName("");
        setNewRoleDesc("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Roles & Permissions
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage roles and configure fine-grained access across your application.
                </p>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <div className="mb-5">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Create New Role
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Add a custom role for your team.
                        </p>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Role Name"
                            placeholder="e.g. Supervisor"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            required
                        />

                        <Input
                            label="Description"
                            placeholder="Optional notes about this role"
                            value={newRoleDesc}
                            onChange={(e) => setNewRoleDesc(e.target.value)}
                        />

                        <Button type="submit" className="w-full" disabled={!newRoleName.trim()}>
                            Create Role
                        </Button>
                    </form>
                </Card>

                <Card className="!p-0 lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Existing Roles
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Manage access and permissions for each role.
                            </p>
                        </div>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                            {roles.length} {roles.length === 1 ? "Role" : "Roles"}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Role</th>
                                    <th className="px-5 py-3.5 font-semibold">Description</th>
                                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading && roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                            Loading roles...
                                        </td>
                                    </tr>
                                ) : roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center">
                                            <p className="font-medium text-slate-700 dark:text-slate-200">
                                                No roles found
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Create your first role using the form.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                            <td className="px-5 py-4">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                                    {role.name}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                                                {role.description || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="!min-h-8 !rounded-md !bg-slate-100 !px-3 !py-1.5 !text-xs !text-slate-700 !shadow-none hover:!bg-slate-200 dark:!bg-slate-700 dark:!text-slate-200 dark:hover:!bg-slate-600"
                                                    >
                                                        Permissions
                                                    </Button>

                                                    <Button
                                                        onClick={() => deleteRole(role.id)}
                                                        className="!min-h-8 !rounded-md !bg-red-50 !px-3 !py-1.5 !text-xs !text-red-700 !shadow-none hover:!bg-red-100 dark:!bg-red-500/10 dark:!text-red-300 dark:hover:!bg-red-500/20"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <AssignPermissionsModal
                isOpen={isModalOpen}
                role={selectedRole}
                allPermissions={allPermissions}
                getRolePermissions={getRolePermissions}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRole(null);
                }}
                onSave={assignPermissions}
            />
        </div>
    );
}
