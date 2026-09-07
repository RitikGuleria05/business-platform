using BusinessPlatform.Application.Interfaces.Sales_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories.Sale_Module
{
    public class SaleRepository : ISaleRepository
    {
        private readonly AppDbContext _context;

        public SaleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Sale>> GetAllAsync()
        {
            return await _context.Sales
                .AsNoTracking()
                .Include(x => x.Customer)
                .OrderByDescending(x => x.SaleDate)
                .ToListAsync();
        }

        public async Task<Sale?> GetByIdAsync(Guid id)
        {
            return await _context.Sales
           .Include(x => x.Customer)
           .Include(x => x.SaleItems)
               .ThenInclude(x => x.Product)
           .Include(x => x.Payments)
           .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Sale?> GetByInvoiceNumberAsync(string invoiceNumber)
        {
            return await _context.Sales.FirstOrDefaultAsync(x => x.InvoiceNumber == invoiceNumber);
        }

        public async Task AddAsync(Sale sale)
        {
            await _context.Sales.AddAsync(sale);
        }

        public void Update(Sale sale)
        {
            _context.Sales.Update(sale);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
