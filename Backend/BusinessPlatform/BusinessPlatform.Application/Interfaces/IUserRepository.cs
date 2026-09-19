using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces
{
    public interface IUserRepository
    {

        Task<User?> GetByEmailAsync(string email);

        Task<User?> GetByIdAsync(Guid id);

        Task AddAsync(User user);

        //Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task<List<string>> GetPermissionsAsync(Guid userId);

        Task SaveChangesAsync();
    }
}
