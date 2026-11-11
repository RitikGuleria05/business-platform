using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Domain.Entities;


// for faking a repo
public class FailingInventoryRepository : IInventory_Main_Repository
{
    public Task AddAsync(Inventory inventory)
    {
        throw new InvalidOperationException(
            "Simulated inventory creation failure.");
    }

    public Task<List<Inventory>> GetAllAsync()
        => throw new NotImplementedException();

    public Task<Inventory?> GetByProductIdAsync(Guid productId)
        => throw new NotImplementedException();

    public Task<List<Inventory>> GetLowStockAsync()
        => throw new NotImplementedException();

    public Task<List<Inventory>> GetOutOfStockAsync()
        => throw new NotImplementedException();

    public void Update(Inventory inventory)
        => throw new NotImplementedException();

    public Task SaveChangesAsync()
        => throw new NotImplementedException();
}