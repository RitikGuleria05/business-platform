using BusinessPlatform.Application.DTOs.SaleReturn;
using BusinessPlatform.Application.Services.Sale_Module;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaleReturnsController : ControllerBase
    {
        private readonly SaleReturnService _saleReturnService;

        public SaleReturnsController(
            SaleReturnService saleReturnService)
        {
            _saleReturnService = saleReturnService;
        }

        // POST: api/salereturns
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateSaleReturnRequest request)
        {
            var result = await _saleReturnService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById),new { id = result.Id },result);
        }

        // GET: api/salereturns/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result =
                await _saleReturnService.GetByIdAsync(id);

            return Ok(result);
        }

        // GET: api/salereturns/sale/{saleId}
        [HttpGet("sale/{saleId:guid}")]
        public async Task<IActionResult> GetBySaleId(
            Guid saleId)
        {
            var result = await _saleReturnService.GetBySaleIdAsync(saleId);

            return Ok(result);
        }
    }
}
