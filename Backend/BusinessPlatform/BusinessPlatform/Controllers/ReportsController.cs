using BusinessPlatform.Application.Services.Reports_Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;

        public ReportsController(
            ReportService reportService)
        {
            _reportService = reportService;
        }

        // GET: api/reports/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var result = await _reportService.GetDashboardSummaryAsync();

            return Ok(result);
        }

        // GET: api/reports/top-products?count=5
        [HttpGet("top-products")]
        public async Task<IActionResult> TopProducts([FromQuery] int count = 5)
        {
            var result =  await _reportService.GetTopProductsAsync(count);

            return Ok(result);
        }

        // GET:
        // api/reports/sales-trend?from=2026-08-01&to=2026-08-20
        [HttpGet("sales-trend")]
        public async Task<IActionResult> SalesTrend([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var result = await _reportService.GetSalesTrendAsync(from, to);

            return Ok(result);
        }
    }
}
