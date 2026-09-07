using BusinessPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Application.Interfaces
{
    public interface IRoleRepository
    {
        Task<List<Role>> GetAllAsync();

        Task<Role?> GetByNameAsync(string name);

        Task AddAsync(Role role);

        Task SaveChangesAsync();

        Task<Role?> GetByIdAsync(Guid id);

        void Update(Role role);

        Task DeleteAsync(Role role);

        Task<List<Permission>> GetPermissionsAsync(Guid roleId);

        Task<bool> HasUsersAsync(Guid roleId); //  for if user is already assigned to the role 

        Task RemovePermissionsAsync(Guid roleId);

        Task AddRolePermissionsAsync(List<RolePermission> rolePermissions);
    }
}
