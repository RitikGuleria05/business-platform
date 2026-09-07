using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly AppDbContext _context;

        public PermissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Permission>> GetAllAsync()
        {
            return await _context.Permissions
                .Include(x => x.Module)
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<Permission?> GetByIdAsync(Guid id)
        {
            return await _context.Permissions
                .Include(x => x.Module)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Permission?> GetByNameAsync(string name)
        {
            return await _context.Permissions
                .FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<List<Permission>> GetByIdsAsync(List<Guid> ids)
        {
            return await _context.Permissions
                .Where(x => ids.Contains(x.Id))
                .ToListAsync();
        }

        public async Task AddAsync(Permission permission)
        {
            await _context.Permissions.AddAsync(permission);
        }

        public void Update(Permission permission)
        {
            _context.Permissions.Update(permission);
        }

        public Task DeleteAsync(Permission permission)
        {
            _context.Permissions.Remove(permission);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsAssignedToAnyRoleAsync(Guid permissionId)
        {
            return await _context.RolePermissions.AnyAsync(rp => rp.PermissionId == permissionId);
        }

    }
}
