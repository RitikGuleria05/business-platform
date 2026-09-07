using BusinessPlatform.Application.DTOs.Inventory_Module;
using BusinessPlatform.Application.Services.Inventory_Module;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {

        private readonly InventoryService _inventoryService;

        public InventoryController(InventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        // GET: api/inventory

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _inventoryService.GetAllAsync());
        }

        // GET: api/inventory/{productId}
        [HttpGet("{productId:guid}")]
        public async Task<IActionResult> GetByProduct(Guid productId)
        {
            return Ok(await _inventoryService.GetByProductIdAsync(productId));
        }

        // PUT: api/inventory/{productId}
        [HttpPut("{productId:guid}")]
        public async Task<IActionResult> UpdateSettings(
            Guid productId,
            UpdateInventoryRequest request)
        {
            await _inventoryService.UpdateInventorySettingsAsync(productId, request);

            return Ok(new
            {
                Message = "Inventory settings updated successfully."
            });
        }

        // POST: api/inventory/increase
        [HttpPost("increase")]
        public async Task<IActionResult> IncreaseStock(
            IncreaseStockRequest request)
        {
            await _inventoryService.IncreaseStockAsync(request);

            return Ok(new
            {
                Message = "Stock increased successfully."
            });
        }

        // POST: api/inventory/decrease
        [HttpPost("decrease")]
        public async Task<IActionResult> DecreaseStock(
            DecreaseStockRequest request)
        {
            await _inventoryService.DecreaseStockAsync(request);

            return Ok(new
            {
                Message = "Stock decreased successfully."
            });
        }

        // POST: api/inventory/adjust
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustStock(
            AdjustStockRequest request)
        {
            await _inventoryService.AdjustStockAsync(request);

            return Ok(new
            {
                Message = "Inventory adjusted successfully."
            });
        }

        // GET: api/inventory/low-stock
        [HttpGet("low-stock")]
        public async Task<IActionResult> LowStock()
        {
            return Ok(await _inventoryService.GetLowStockAsync());
        }

        // GET: api/inventory/out-of-stock
        [HttpGet("out-of-stock")]
        public async Task<IActionResult> OutOfStock()
        {
            return Ok(await _inventoryService.GetOutOfStockAsync());
        }
        // we will do the repositry and dtos,service,controller,testing
    }
}
