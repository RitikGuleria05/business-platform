using BusinessPlatform.Application.DTOs.Role;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Services
{
    public class RoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionRepository _permissionRepository;

        public RoleService(IRoleRepository roleRepository, IPermissionRepository permissionRepository)
        {
            _roleRepository = roleRepository;
            _permissionRepository = permissionRepository;
        }

        public async Task<List<RoleResponse>> GetAllAsync()
        {
            var roles = await _roleRepository.GetAllAsync();

            return roles.Select(r => new RoleResponse
            {
                Id = r.Id,
                Name = r.Name
            }).ToList();
        }

        public async Task<RoleResponse> CreateAsync(CreateRoleRequest request)
        {
            var existingRole = await _roleRepository.GetByNameAsync(request.Name);

            if (existingRole != null)
            {
                throw new Exception("Role already exists.");
            }

            var role = new Role
            {
                Id = Guid.NewGuid(),

                Name = request.Name.Trim()
            };

            await _roleRepository.AddAsync(role);

            await _roleRepository.SaveChangesAsync();

            return new RoleResponse
            {
                Id = role.Id,

                Name = role.Name
            };
        }

        public async Task<RoleResponse> GetByIdAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);

            if (role == null)
            {
                throw new Exception("Role not found.");
            }

            return new RoleResponse
            {
                Id = role.Id,
                Name = role.Name
            };
        }

        public async Task<RoleResponse> UpdateAsync(Guid id,UpdateRoleRequest request)
        {
            var role = await _roleRepository.GetByIdAsync(id);

            if (role == null)
                throw new Exception("Role not found.");

            var duplicate =
                await _roleRepository.GetByNameAsync(request.Name);

            if (duplicate != null &&
                duplicate.Id != id)
            {
                throw new Exception("Role already exists.");
            }

            role.Name = request.Name.Trim();

            _roleRepository.Update(role);

            await _roleRepository.SaveChangesAsync();

            return new RoleResponse
            {
                Id = role.Id,
                Name = role.Name
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);

            if (role == null)
            {
                throw new Exception("Role not found.");
            }

            bool hasUsers = await _roleRepository.HasUsersAsync(id);

            if (hasUsers)
            {
                throw new Exception("Cannot delete role because it is assigned to users.");
            }

            if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Admin role cannot be deleted.");
            }

            if (role.Name.Equals("Employee", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Employee role cannot be deleted.");
            }

            await _roleRepository.DeleteAsync(role);

            await _roleRepository.SaveChangesAsync();
        }

        public async Task<List<PermissionResponse>> GetPermissionsAsync(Guid roleId)
        {
            var role = await _roleRepository.GetByIdAsync(roleId);

            if (role == null)
            {
                throw new Exception("Role not found.");
            }

            var permissions = await _roleRepository.GetPermissionsAsync(roleId);

            return permissions.Select(x => new PermissionResponse
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        }

        public async Task AssignPermissionsAsync(Guid roleId, AssignPermissionsRequest request)
        {
            var role = await _roleRepository.GetByIdAsync(roleId);

            if (role == null)
                throw new Exception("Role not found.");

            var permissions = await _permissionRepository.GetByIdsAsync(request.PermissionIds);

            if (permissions.Count != request.PermissionIds.Count)
                throw new Exception("One or more permissions are invalid.");

            await _roleRepository.RemovePermissionsAsync(roleId);

            var rolePermissions = permissions.Select(permission => new RolePermission
            {
                Id = Guid.NewGuid(),

                RoleId = roleId,

                PermissionId = permission.Id
            }).ToList();

            await _roleRepository.AddRolePermissionsAsync(rolePermissions);

            await _roleRepository.SaveChangesAsync();
        }

        // Why don't we return Role directly?

        //Because the entity represents your database.

        //The API should return a DTO.
    }
}
