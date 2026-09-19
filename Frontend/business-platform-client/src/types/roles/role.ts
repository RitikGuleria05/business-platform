export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  moduleId: string;
  moduleName: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}