using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Product_Module
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(Guid id);

        Task<Product?> GetBySkuAsync(string sku);

        Task<Product?> GetByBarcodeAsync(string barcode);

        Task<bool> CategoryExistsAsync(Guid categoryId);

        Task AddAsync(Product product);

        void Update(Product product);

        Task DeleteAsync(Product product);

        Task<bool> HasSaleItemsAsync(Guid productId);

        Task SaveChangesAsync();

        Task BeginTransactionAsync();

        Task CommitTransactionAsync();

        Task RollbackTransactionAsync();
    }
}
