import { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { roleApi } from '../../services/roles/roleApi';
import type { Role, PermissionResponse } from '../../types/roles/role';

interface Props {
  role: Role | null;
  isOpen: boolean;
  allPermissions: PermissionResponse[];
  getRolePermissions: (
    roleId: string
  ) => Promise<PermissionResponse[]>;
  onClose: () => void;
  onSave: (
    roleId: string,
    permissionIds: string[]
  ) => Promise<void>;
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
    if (role && isOpen) {
      setFetching(true);
      getRolePermissions(role.id)
        .then((data) => setSelectedIds(data.map((p) => p.id)))
        .catch(() => setSelectedIds([]))
        .finally(() => setFetching(false));
    }
  }, [role, isOpen]);

  // Group all available permissions by moduleName
  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce<Record<string, PermissionResponse[]>>((acc, perm) => {
      const group = perm.moduleName || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(perm);
      return acc;
    }, {});
  }, [allPermissions]);

  if (!isOpen || !role) return null;

  const togglePermission = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Permissions for Role: <span className="text-indigo-600">{role.name}</span>
          </h3>
          <p className="text-xs text-slate-500">Configure what actions this role can perform</p>
        </div>

        {fetching ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading assigned permissions...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <div key={moduleName} className="rounded-lg border border-slate-200 p-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {moduleName} Module
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedIds.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span>{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <Button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Permissions
          </Button>
        </div>
      </Card>
    </div>
  );
}