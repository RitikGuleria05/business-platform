using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Application.Interfaces.Customer_Module
{
    public interface ICustomerRepository
    {
        Task<List<Customer>> GetAllAsync();

        Task<Customer?> GetByIdAsync(Guid id);

        Task<Customer?> GetByEmailAsync(string email);

        Task<Customer?> GetByPhoneAsync(string phoneNumber);

        Task AddAsync(Customer customer);

        void Update(Customer customer);

        Task DeleteAsync(Customer customer);

        Task<bool> HasSalesAsync(Guid customerId);

        Task SaveChangesAsync();
    }
}
