using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Sales_Module
{
    public interface ISaleRepository
    {
        Task<List<Sale>> GetAllAsync();

        Task<Sale?> GetByIdAsync(Guid id);

        Task<Sale?> GetByInvoiceNumberAsync(string invoiceNumber);

        Task AddAsync(Sale sale);

        void Update(Sale sale);

        Task SaveChangesAsync();
    }
}
