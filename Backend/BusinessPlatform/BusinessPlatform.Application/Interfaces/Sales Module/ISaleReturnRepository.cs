using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Sales_Module
{
    public interface ISaleReturnRepository
    {
        Task<SaleReturn?> GetByIdAsync(Guid id);

        Task<List<SaleReturn>> GetBySaleIdAsync(Guid saleId);

        Task AddAsync(SaleReturn saleReturn);
    }
}
