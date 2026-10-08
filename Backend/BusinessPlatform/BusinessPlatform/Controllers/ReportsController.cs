using BusinessPlatform.API.Attributes;
using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Application.Services.Reports_Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;
        private readonly IExcelReportService _excelReportService;
        private readonly IPdfReportService _pdfReportService;


        public ReportsController(ReportService reportService, IExcelReportService excelReportService, IPdfReportService pdfReportService)
        {
            _reportService = reportService;
            _excelReportService = excelReportService;
            _pdfReportService = pdfReportService;
        }

        // GET: api/reports/dashboard
        [HttpGet("dashboard")]
        [Permission("reports.dashboard")]
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

        [HttpGet("sales")]
        [Permission("reports.sales")]
        public async Task<IActionResult> SalesReport([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var result = await _reportService.GetSalesReportAsync(from,to);

            return Ok(result);
        }

        [HttpGet("products")]
        [Permission("reports.products")]
        public async Task<IActionResult> ProductReport([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var result = await _reportService.GetProductReportAsync(from, to);

            return Ok(result);
        }

        [HttpGet("inventory")]
        [Permission("reports.inventory")]
        public async Task<IActionResult> InventoryReport()
        {
            var result = await _reportService.GetInventoryReportAsync();

            return Ok(result);
        }

        [HttpGet("low-stock")]
        [Permission("reports.inventory")]
        public async Task<IActionResult> LowStock()
        {
            var result = await _reportService.GetLowStockProductsAsync();

            return Ok(result);
        }

        [HttpGet("customers")]
        [Permission("reports.customers")]
        public async Task<IActionResult> CustomerReport([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var result = await _reportService.GetCustomerReportAsync(from,to);

            return Ok(result);
        }

        [HttpGet("sales/export/excel")]
        [Permission("reports.export")]
        public async Task<IActionResult> ExportSalesExcel([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var file = await _excelReportService.GenerateSalesReportAsync(from,to);

            return File(file,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"Sales-Report-{from:yyyy-MM-dd}-to-{to:yyyy-MM-dd}.xlsx");
        }

        [HttpGet("products/export/excel")]
        [Permission("reports.export")]
        public async Task<IActionResult> ExportProductExcel([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var file = await _excelReportService.GenerateProductReportAsync(from,to);

            return File(file,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"Product-Report-{from:yyyy-MM-dd}-to-{to:yyyy-MM-dd}.xlsx");
        }

        [HttpGet("inventory/export/excel")]
        [Permission("reports.export")]
        public async Task<IActionResult> ExportInventoryExcel()
        {
            var file = await _excelReportService.GenerateInventoryReportAsync();

            return File(file,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"Inventory-Report-{DateTime.UtcNow:yyyy-MM-dd}.xlsx");
        }

        [HttpGet("customers/export/excel")]
        [Permission("reports.export")]
        public async Task<IActionResult> ExportCustomerExcel([FromQuery] DateTime from,[FromQuery] DateTime to)
        {
            var file = await _excelReportService.GenerateCustomerReportAsync(from,to);

            return File(file,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"Customer-Report-{from:yyyy-MM-dd}-to-{to:yyyy-MM-dd}.xlsx");
        }

        // pdf export endpoints
        //[HttpGet("sales/export/pdf")]
        //public async Task<IActionResult> ExportSalesPdf([FromQuery] DateTime from,[FromQuery] DateTime to)
        //{
        //    var file = await _pdfReportService.GenerateSalesReportAsync(from,to);

        //    return File(file,"application/pdf",$"Sales-Report-{from:yyyy-MM-dd}-to-{to:yyyy-MM-dd}.pdf");
        //}

    }
}
