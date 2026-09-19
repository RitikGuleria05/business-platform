import { useState, useEffect, useCallback } from 'react';
import { roleApi } from '../../services/roles/roleApi';
import type { Role, PermissionResponse, CreateRoleRequest } from '../../types/roles/role';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleApi.getRoles(),
        roleApi.getAllPermissions(),
      ]);
      setRoles(rolesData);
      setAllPermissions(permsData);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (data: CreateRoleRequest) => {
    const created = await roleApi.createRole(data);
    setRoles((prev) => [...prev, created]);
    return created;
  };

  const deleteRole = async (id: string) => {
    await roleApi.deleteRole(id);
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const getRolePermissions = async (roleId: string) => {
    return await roleApi.getRolePermissions(roleId);
  };

  const assignPermissions = async (roleId: string, permissionIds: string[]) => {
    await roleApi.assignPermissions(roleId, { permissionIds });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    roles,
    allPermissions,
    loading,
    error,
    createRole,
    deleteRole,
    getRolePermissions,
    assignPermissions,
    reload: loadData,
  };
};