using BusinessPlatform.API.Attributes;
using BusinessPlatform.Application.DTOs.Sale_Module;
using BusinessPlatform.Application.Services;
using BusinessPlatform.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly SaleService _saleService;

        public SalesController(SaleService saleService)
        {
            _saleService = saleService;
        }

        // =========================================================
        // GET: api/sales
        // =========================================================

        [HttpGet]
        [Permission("sales.read")]
        public async Task<IActionResult> GetAll()
        {
            var sales =
                await _saleService.GetAllAsync();

            return Ok(sales);
        }

        // =========================================================
        // GET: api/sales/{id}
        // =========================================================

        [HttpGet("{id:guid}")]
        [Permission("sales.read")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var sale =
                await _saleService.GetByIdAsync(id);

            return Ok(sale);
        }

        // =========================================================
        // POST: api/sales
        // =========================================================

        [HttpPost]
        [Permission("sales.create")]
        public async Task<IActionResult> Create(CreateSaleRequest request)
        {
            var sale =
                await _saleService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = sale.Id },
                sale);
        }

        [HttpPost("{id:guid}/cancel")]
        [Permission("sales.cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            await _saleService.CancelAsync(id);

            return Ok(new
            {
                Message = "Sale cancelled successfully."
            });
        }

        //Later we'll handle cancellation/returns/refunds as proper business workflows rather than a simple CRUD DELETE.

    }
}
