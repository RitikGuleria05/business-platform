using BusinessPlatform.Application.DTOs.Customer_Module;
using BusinessPlatform.Application.Interfaces.Customer_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Customer_Module
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<List<CustomerResponse>> GetAllAsync()
        {
            var customers = await _customerRepository.GetAllAsync();

            return customers.Select(c => new CustomerResponse
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                Address = c.Address,
                City = c.City,
                State = c.State,
                PostalCode = c.PostalCode,
                IsActive = c.IsActive
            }).ToList();
        }

        public async Task<CustomerResponse> GetByIdAsync(Guid id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
                throw new NotFoundException("Customer not found.");

            return new CustomerResponse
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                Address = customer.Address,
                City = customer.City,
                State = customer.State,
                PostalCode = customer.PostalCode,
                IsActive = customer.IsActive
            };
        }

        public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request)
        {
            if (await _customerRepository.GetByEmailAsync(request.Email) != null)
                throw new BadRequestException("Email already exists.");

            if (await _customerRepository.GetByPhoneAsync(request.PhoneNumber) != null)
                throw new BadRequestException("Phone number already exists.");

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                City = request.City,
                State = request.State,
                PostalCode = request.PostalCode,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _customerRepository.AddAsync(customer);
            await _customerRepository.SaveChangesAsync();

            return await GetByIdAsync(customer.Id);
        }

        public async Task<CustomerResponse> UpdateAsync(Guid id,UpdateCustomerRequest request)
        {
            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
                throw new NotFoundException("Customer not found.");

            var email = await _customerRepository.GetByEmailAsync(request.Email);

            if (email != null && email.Id != id)
                throw new BadRequestException("Email already exists.");

            var phone = await _customerRepository.GetByPhoneAsync(request.PhoneNumber);

            if (phone != null && phone.Id != id)
                throw new BadRequestException("Phone number already exists.");

            customer.FirstName = request.FirstName;
            customer.LastName = request.LastName;
            customer.Email = request.Email;
            customer.PhoneNumber = request.PhoneNumber;
            customer.Address = request.Address;
            customer.City = request.City;
            customer.State = request.State;
            customer.PostalCode = request.PostalCode;
            customer.IsActive = request.IsActive;
            customer.UpdatedAt = DateTime.UtcNow;

            _customerRepository.Update(customer);

            await _customerRepository.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(Guid id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);

            if (customer == null)
                throw new NotFoundException("Customer not found.");

            if (await _customerRepository.HasSalesAsync(id))
                throw new BadRequestException(
                    "Customer cannot be deleted because sales exist.");

            await _customerRepository.DeleteAsync(customer);

            await _customerRepository.SaveChangesAsync();
        }

    }
}
