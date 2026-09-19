using BusinessPlatform.Application.DTOs.Permission;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Services
{
    public class PermissionService
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly IModuleRepository _moduleRepository;

        public PermissionService(IPermissionRepository permissionRepository, IModuleRepository moduleRepository)
        {
            _permissionRepository = permissionRepository;
            _moduleRepository = moduleRepository;
        }

        public async Task<List<PermissionResponse>> GetAllAsync()
        {
            var permissions = await _permissionRepository.GetAllAsync();

            return permissions.Select(x => new PermissionResponse
            {
                Id = x.Id,
                Name = x.Name,
                ModuleId = x.ModuleId,
                ModuleName = x.Module.Name
            }).ToList();
        }

        public async Task<PermissionResponse> GetByIdAsync(Guid id)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);

            if (permission == null)
                throw new Exception("Permission not found.");

            return new PermissionResponse
            {
                Id = permission.Id,
                Name = permission.Name,
                ModuleId = permission.ModuleId,
                ModuleName = permission.Module.Name
            };
        }

        public async Task<PermissionResponse> CreateAsync(CreatePermissionRequest request)
        {
            var exists = await _permissionRepository.GetByNameAsync(request.Name);

            if (exists != null)
                throw new Exception("Permission already exists.");

            var module = await _moduleRepository.GetByIdAsync(request.ModuleId);

            if (module == null)
                throw new Exception("Module not found.");

            var permission = new Permission
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                ModuleId = request.ModuleId
            };

            await _permissionRepository.AddAsync(permission);
            await _permissionRepository.SaveChangesAsync();

            return new PermissionResponse
            {
                Id = permission.Id,
                Name = permission.Name,
                ModuleId = module.Id,
                ModuleName = module.Name
            };
        }

        public async Task<PermissionResponse> UpdateAsync(Guid id,UpdatePermissionRequest request)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);

            if (permission == null)
            {
                throw new Exception("Permission not found.");
            }

            var existingPermission = await _permissionRepository.GetByNameAsync(request.Name);

            if (existingPermission != null && existingPermission.Id != id)
            {
                throw new Exception("Permission name already exists.");
            }

            var module = await _moduleRepository.GetByIdAsync(request.ModuleId);

            if (module == null)
            {
                throw new Exception("Module not found.");
            }

            permission.Name = request.Name.Trim();
            permission.ModuleId = request.ModuleId;

            _permissionRepository.Update(permission);

            await _permissionRepository.SaveChangesAsync();

            return new PermissionResponse
            {
                Id = permission.Id,
                Name = permission.Name,
                ModuleId = module.Id,
                ModuleName = module.Name
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var permission = await _permissionRepository.GetByIdAsync(id);

            if (permission == null)
            {
                throw new Exception("Permission not found.");
            }

            bool isAssigned = await _permissionRepository.IsAssignedToAnyRoleAsync(id);

            if (isAssigned)
            {
                throw new Exception("Cannot delete permission because it is assigned to one or more roles.");
            }

            await _permissionRepository.DeleteAsync(permission);

            await _permissionRepository.SaveChangesAsync();
        }

    }
}
