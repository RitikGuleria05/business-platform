using BusinessPlatform.Application.Interfaces.Product_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Infrastructure.Repositories.Product_Module
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction? _transaction;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(x => x.Category)
                .Include(x => x.Inventory)
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _context.Products
                .Include(x => x.Category)
                .Include(x => x.Inventory)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Product?> GetBySkuAsync(string sku)
        {
            return await _context.Products
                .FirstOrDefaultAsync(x => x.SKU == sku);
        }

        public async Task<Product?> GetByBarcodeAsync(string barcode)
        {
            return await _context.Products
                .FirstOrDefaultAsync(x => x.Barcode == barcode);
        }

        public async Task<bool> CategoryExistsAsync(Guid categoryId)
        {
            return await _context.Categories
                .AnyAsync(x => x.Id == categoryId);
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        public void Update(Product product)
        {
            _context.Products.Update(product);
        }

        public Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);

            return Task.CompletedTask;
        }

        public async Task<bool> HasSaleItemsAsync(Guid productId)
        {
            // We'll implement this after SaleItem is created.
            return false;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if(_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
            }    
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
            }
        }

    }
}
