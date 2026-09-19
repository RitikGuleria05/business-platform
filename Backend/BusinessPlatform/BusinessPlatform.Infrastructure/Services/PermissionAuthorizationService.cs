using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Services
{
    public class PermissionAuthorizationService : IPermissionAuthorizationService
    {
        // used in the permission middleware
        private readonly AppDbContext _context;

        public PermissionAuthorizationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasPermissionAsync(Guid userId,string permissionName)
        {

            var result = await _context.Users.Where(u => u.Id == userId).SelectMany(u =>u.Role.RolePermissions)
                .AnyAsync(rp =>
                    rp.Permission.Name
                    == permissionName
                );

            return result;
        }

    }
}
