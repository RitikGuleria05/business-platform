using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces
{
    public interface IPermissionRepository
    {
        Task<List<Permission>> GetAllAsync();

        Task<Permission?> GetByIdAsync(Guid id);

        Task<Permission?> GetByNameAsync(string name);

        Task<List<Permission>> GetByIdsAsync(List<Guid> ids);

        Task AddAsync(Permission permission);

        void Update(Permission permission);

        Task DeleteAsync(Permission permission);

        Task<bool> IsAssignedToAnyRoleAsync(Guid permissionId);

        Task SaveChangesAsync();

    }
}
