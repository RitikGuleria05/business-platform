using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {

        private readonly AppDbContext _context;


        public RoleRepository(AppDbContext dbContext)
        {
            _context = dbContext;
        }


        public async Task<List<Role>> GetAllAsync()
        {
            return await _context.Roles.AsNoTracking().OrderBy(r => r.Name).ToListAsync();
        }

        public async Task<Role?> GetByNameAsync(string name)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task AddAsync(Role role)
        {
            await _context.Roles.AddAsync(role);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Role?> GetByIdAsync(Guid id)
        {
            return await _context.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public void Update(Role role)
        {
            _context.Roles.Update(role);
        }

        public Task DeleteAsync(Role role)
        {
            _context.Roles.Remove(role);

            return Task.CompletedTask;
        }

        public async Task<List<Permission>> GetPermissionsAsync(Guid roleId)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> HasUsersAsync(Guid roleId)
        {
            return await _context.Users.AnyAsync(x => x.RoleId == roleId);
        }

        public async Task RemovePermissionsAsync(Guid roleId)
        {
            var permissions = await _context.RolePermissions
                .Where(x => x.RoleId == roleId)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(permissions);
        }

        public async Task AddRolePermissionsAsync(List<RolePermission> rolePermissions)
        {
            await _context.RolePermissions.AddRangeAsync(rolePermissions);
        }

        // linked to role service class

    }
}
