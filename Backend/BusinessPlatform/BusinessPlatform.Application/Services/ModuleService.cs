using BusinessPlatform.Application.DTOs.Module;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Services
{
    public class ModuleService
    {
        private readonly IModuleRepository _moduleRepository;

        public ModuleService(IModuleRepository moduleRepository)
        {
            _moduleRepository = moduleRepository;
        }

        public async Task<List<ModuleResponse>> GetAllAsync()
        {
            var modules = await _moduleRepository.GetAllAsync();

            return modules.Select(x => new ModuleResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            }).ToList();
        }

        public async Task<ModuleResponse> GetByIdAsync(Guid id)
        {
            var module = await _moduleRepository.GetByIdAsync(id);

            if (module == null)
                throw new Exception("Module not found.");

            return new ModuleResponse
            {
                Id = module.Id,
                Name = module.Name,
                Description = module.Description
            };
        }

        public async Task<ModuleResponse> CreateAsync(CreateModuleRequest request)
        {
            var existing = await _moduleRepository.GetByNameAsync(request.Name);

            if (existing != null)
                throw new Exception("Module already exists.");

            var module = new Module
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description
            };

            await _moduleRepository.AddAsync(module);

            await _moduleRepository.SaveChangesAsync();

            return new ModuleResponse
            {
                Id = module.Id,
                Name = module.Name,
                Description = module.Description
            };
        }

        public async Task<ModuleResponse> UpdateAsync(Guid id,UpdateModuleRequest request)
        {
            var module = await _moduleRepository.GetByIdAsync(id);

            if (module == null)
                throw new Exception("Module not found.");

            var duplicate = await _moduleRepository.GetByNameAsync(request.Name);

            if (duplicate != null && duplicate.Id != id)
                throw new Exception("Module already exists.");

            module.Name = request.Name.Trim();
            module.Description = request.Description;

            _moduleRepository.Update(module);

            await _moduleRepository.SaveChangesAsync();

            return new ModuleResponse
            {
                Id = module.Id,
                Name = module.Name,
                Description = module.Description
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var module = await _moduleRepository.GetByIdAsync(id);

            if (module == null)
                throw new Exception("Module not found.");

            bool hasPermissions = await _moduleRepository.HasPermissionsAsync(id);

            if (hasPermissions)
                throw new Exception("Cannot delete module because permissions are assigned to it.");

            await _moduleRepository.DeleteAsync(module);

            await _moduleRepository.SaveChangesAsync();
        }
    }
}
