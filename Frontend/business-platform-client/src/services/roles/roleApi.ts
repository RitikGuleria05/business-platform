import api from '../api';
import type {
    Role,
    CreateRoleRequest,
    PermissionResponse,
    AssignPermissionsRequest,
} from '../../types/roles/role';

export const roleApi = {
  getRoles: async (): Promise<Role[]> => (await api.get('/role')).data,
  createRole: async (data: CreateRoleRequest): Promise<Role> => (await api.post('/role', data)).data,
  deleteRole: async (id: string): Promise<void> => { await api.delete(`/role/${id}`); },

  getAllPermissions: async (): Promise<PermissionResponse[]> => (await api.get('/permission')).data,
  getRolePermissions: async (roleId: string): Promise<PermissionResponse[]> =>
    (await api.get(`/role/${roleId}/permissions`)).data,
  assignPermissions: async (roleId: string, payload: AssignPermissionsRequest): Promise<void> => {
    await api.post(`/role/${roleId}/permissions`, payload);
  },
};