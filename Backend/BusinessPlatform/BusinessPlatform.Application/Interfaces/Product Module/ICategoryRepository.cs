using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Product_Module
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();

        Task<Category?> GetByIdAsync(Guid id);

        Task<Category?> GetByNameAsync(string name);

        Task AddAsync(Category category);

        void Update(Category category);

        Task DeleteAsync(Category category);
        Task<bool> HasProductsAsync(Guid categoryId);

        Task SaveChangesAsync();
    }
}
