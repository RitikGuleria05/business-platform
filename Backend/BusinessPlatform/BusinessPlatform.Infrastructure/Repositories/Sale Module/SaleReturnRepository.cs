using BusinessPlatform.Application.Interfaces.Sales_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories.Sale_Module
{
    public class SaleReturnRepository : ISaleReturnRepository
    {
        private readonly AppDbContext _context;

        public SaleReturnRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SaleReturn?> GetByIdAsync(Guid id)
        {
            return await _context.SaleReturns
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Sale)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<SaleReturn>> GetBySaleIdAsync(Guid saleId)
        {
            return await _context.SaleReturns
                .AsNoTracking()
                .Include(x => x.Items)
                    .ThenInclude(x => x.Product)
                .Where(x => x.SaleId == saleId)
                .ToListAsync();
        }

        public async Task AddAsync(SaleReturn saleReturn)
        {
            await _context.SaleReturns.AddAsync(saleReturn);
        }

    }
}
