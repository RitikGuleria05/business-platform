import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useRoles } from '../../hooks/roles/useRoles';
import { AssignPermissionsModal } from '../../components/roles/AssignPermissionsModal';
import type { Role } from '../../types/roles/role';

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
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    await createRole({
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || undefined,
    });
    setNewRoleName('');
    setNewRoleDesc('');
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-sm text-slate-500">
          Configure roles and assign fine-grained module access
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <h3 className="font-semibold text-slate-900 mb-3">Create New Role</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              label="Role Name"
              placeholder="e.g. Supervisor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <Input
              label="Description"
              placeholder="Optional notes"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Create Role
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    Loading roles...
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {r.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedRole(r);
                          setIsModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        Permissions
                      </Button>
                      <Button
                        onClick={() => deleteRole(r.id)}
                        className="px-2.5 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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