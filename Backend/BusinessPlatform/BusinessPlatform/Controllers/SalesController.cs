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
        public async Task<IActionResult> Create(
            CreateSaleRequest request)
        {
            var sale =
                await _saleService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = sale.Id },
                sale);
        }

        [HttpPost("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            await _saleService.CancelAsync(id);

            return Ok(new
            {
                Message = "Sale cancelled successfully."
            });
        }

        //Later we'll handle cancellation/returns/refunds as proper business workflows rather than a simple CRUD DELETE.

        //At this point your core Sales creation flow is implemented.The next thing I recommend is testing this with dummy products, inventory, customer and payment data in Swagger, before adding returns, reports, or analytics.

        //So don't rewrite this response structure now. We can polish enum serialization and add things like remaining balance, returns, cancellation, and sales history later when we reach that stage.
    }
}
