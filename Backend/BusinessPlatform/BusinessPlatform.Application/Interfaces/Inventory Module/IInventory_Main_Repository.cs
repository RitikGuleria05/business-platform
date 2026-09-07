using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Inventory_Module
{
    public interface IInventory_Main_Repository
    {
        Task<List<Inventory>> GetAllAsync();

        Task<Inventory?> GetByProductIdAsync(Guid productId);

        Task<List<Inventory>> GetLowStockAsync();

        Task<List<Inventory>> GetOutOfStockAsync();

        Task AddAsync(Inventory inventory);

        void Update(Inventory inventory);

        Task SaveChangesAsync();
    }
}
