using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces
{
    public interface IModuleRepository
    {
        Task<List<Module>> GetAllAsync();

        Task<Module?> GetByIdAsync(Guid id);

        Task<Module?> GetByNameAsync(string name);

        Task AddAsync(Module module);

        void Update(Module module);

        Task DeleteAsync(Module module);

        Task<bool> HasPermissionsAsync(Guid moduleId);

        Task SaveChangesAsync();
    }
}
