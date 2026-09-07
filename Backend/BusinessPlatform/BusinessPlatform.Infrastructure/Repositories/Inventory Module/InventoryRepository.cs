using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories.Inventory_Module
{
    public class InventoryRepository : IInventory_Main_Repository
    {

        private readonly AppDbContext _context;

        public InventoryRepository(AppDbContext context)
        {
            _context = context;
        }


        public async  Task<List<Inventory>> GetAllAsync()
        {
            return await _context.Inventories
            .Include(i => i.Product)
            .AsNoTracking()
            .OrderBy(i => i.Product.Name)
            .ToListAsync();
        }

        public async Task<Inventory?> GetByProductIdAsync(Guid productId)
        {
            return await _context.Inventories.Include(i => i.Product).FirstOrDefaultAsync(i => i.ProductId == productId);
        }

        public async Task<List<Inventory>> GetLowStockAsync()
        {
            return await _context.Inventories
                .Include(i => i.Product)
                .Where(i => i.QuantityInStock <= i.ReorderLevel)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Inventory>> GetOutOfStockAsync()
        {
            return await _context.Inventories
                .Include(i => i.Product)
                .Where(i => i.QuantityInStock == 0)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync(Inventory inventory)
        {
            await _context.Inventories.AddAsync(inventory);
        }

        public void Update(Inventory inventory)
        {
            _context.Inventories.Update(inventory);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

    }
}
