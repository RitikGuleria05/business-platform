using BusinessPlatform.Application.DTOs.Customer_Module;
using BusinessPlatform.Application.Services.Customer_Module;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _customerService.GetAllAsync());
        }

        // GET: api/customers/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await _customerService.GetByIdAsync(id));
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> Create(CreateCustomerRequest request)
        {
            var customer = await _customerService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = customer.Id },
                customer);
        }

        // PUT: api/customers/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id,UpdateCustomerRequest request)
        {
            return Ok(await _customerService.UpdateAsync(id, request));
        }

        // DELETE: api/customers/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _customerService.DeleteAsync(id);

            return NoContent();
        }
    }
}
