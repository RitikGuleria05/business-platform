
import { useState, useEffect, useMemo } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import type { Role, PermissionResponse } from "../../types/roles/role";

interface Props {
    role: Role | null;
    isOpen: boolean;
    allPermissions: PermissionResponse[];
    getRolePermissions: (roleId: string) => Promise<PermissionResponse[]>;
    onClose: () => void;
    onSave: (roleId: string, permissionIds: string[]) => Promise<void>;
}

export function AssignPermissionsModal({
    role,
    isOpen,
    allPermissions,
    getRolePermissions,
    onClose,
    onSave,
}: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!role || !isOpen) return;

        let isMounted = true;

        const loadPermissions = async () => {
            setFetching(true);

            try {
                const data = await getRolePermissions(role.id);

                if (isMounted) {
                    setSelectedIds(data.map((permission) => permission.id));
                }
            } catch {
                if (isMounted) setSelectedIds([]);
            } finally {
                if (isMounted) setFetching(false);
            }
        };

        loadPermissions();

        return () => {
            isMounted = false;
        };
    }, [role, isOpen, getRolePermissions]);

    const groupedPermissions = useMemo(() => {
        return allPermissions.reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
            const group = permission.moduleName || "General";

            if (!acc[group]) acc[group] = [];

            acc[group].push(permission);
            return acc;
        }, {});
    }, [allPermissions]);

    if (!isOpen || !role) return null;

    const togglePermission = (id: string) => {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            await onSave(role.id, selectedIds);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) onClose();
            }}
        >
            <Card
                className="flex max-h-[85vh] w-full max-w-2xl flex-col !gap-0 !overflow-hidden !p-0 shadow-2xl dark:border-slate-700"
            >
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Manage Permissions
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Configure access for{" "}
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {role.name}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <span className="text-xl leading-none">&times;</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {fetching ? (
                        <div className="flex min-h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                            Loading assigned permissions...
                        </div>
                    ) : Object.keys(groupedPermissions).length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                No permissions available
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Add permissions before assigning them to a role.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
                                <section
                                    key={moduleName}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                            {moduleName}
                                        </h4>

                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {permissions.filter((permission) => selectedIds.includes(permission.id)).length}
                                            {" / "}
                                            {permissions.length} selected
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                                        {permissions.map((permission) => {
                                            const checked = selectedIds.includes(permission.id);

                                            return (
                                                <label
                                                    key={permission.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                                        checked
                                                            ? "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/40 dark:bg-indigo-500/10"
                                                            : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => togglePermission(permission.id)}
                                                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-indigo-500"
                                                    />

                                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                                        {permission.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-between dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="self-center text-xs text-slate-500 dark:text-slate-400">
                        {selectedIds.length} permissions selected
                    </p>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="!bg-white !text-slate-700 !shadow-none hover:!bg-slate-100 dark:!bg-slate-700 dark:!text-slate-200 dark:hover:!bg-slate-600"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSave}
                            loading={saving}
                            disabled={fetching}
                        >
                            Save Permissions
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
