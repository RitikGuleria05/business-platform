using BusinessPlatform.Application.DTOs.Reports;
using BusinessPlatform.Application.DTOs.Reports.Products;
using BusinessPlatform.Application.DTOs.Reports.Sales;
using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Reports_Service
{
    public class ReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<DashboardSummaryResponse> GetDashboardSummaryAsync()
        {
            return await _reportRepository.GetDashboardSummaryAsync();
        }

        public async Task<List<TopProductResponse>> GetTopProductsAsync(int count = 5)
        {
            if (count <= 0)
                count = 5;

            if (count > 20)
                count = 20;

            return await _reportRepository.GetTopProductsAsync(count);
        }

        public async Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from,DateTime to)
        {
            if (from.Date > to.Date)
            {
                throw new BadRequestException(
                    "From date cannot be greater than To date.");
            }

            if ((to.Date - from.Date).TotalDays > 365)
            {
                throw new BadRequestException(
                    "Date range cannot exceed 366 days.");
            }

            var salesTrend = await _reportRepository.GetSalesTrendAsync(from.Date,to.Date);

            var salesByDate = salesTrend.ToDictionary(x => x.Date.Date);

            var result = new List<SalesTrendResponse>();

            for (var date = from.Date; date <= to.Date; date = date.AddDays(1))
            {
                if (salesByDate.TryGetValue(date, out var sales))
                {
                    result.Add(sales);
                }
                else
                {
                    result.Add(new SalesTrendResponse
                    {
                        Date = date,
                        Orders = 0,
                        Revenue = 0
                    });
                }
            }

            return result;
        }

        public async Task<SalesReportResponse> GetSalesReportAsync(DateTime from,DateTime to)
        {
            if (from.Date > to.Date)
            {
                throw new BadRequestException("From date cannot be greater than To date.");
            }

            if ((to.Date - from.Date).TotalDays > 365)
            {
                throw new BadRequestException("Date range cannot exceed 366 days.");
            }

            return await _reportRepository.GetSalesReportAsync(from.Date,to.Date);
        }

        public async Task<ProductReportResponse> GetProductReportAsync(DateTime from,DateTime to)
        {
            if (from.Date > to.Date)
            {
                throw new BadRequestException("From date cannot be greater than To date.");
            }

            if ((to.Date - from.Date).TotalDays > 365)
            {
                throw new BadRequestException("Date range cannot exceed 366 days.");
            }

            return await _reportRepository.GetProductReportAsync(from.Date,to.Date);
        }

        public async Task<InventoryReportResponse> GetInventoryReportAsync()
        {
            return await _reportRepository.GetInventoryReportAsync();
        }

        public async Task<List<LowStockProductResponse>> GetLowStockProductsAsync()
        {
            return await _reportRepository.GetLowStockProductsAsync();
        }

        public async Task<CustomerReportResponse> GetCustomerReportAsync(DateTime from,DateTime to)
        {
            if (from.Date > to.Date)
            {
                throw new BadRequestException("From date cannot be greater than To date.");
            }

            if ((to.Date - from.Date).TotalDays > 365)
            {
                throw new BadRequestException("Date range cannot exceed 366 days.");
            }

            return await _reportRepository.GetCustomerReportAsync(from.Date,to.Date);
        }
    }
}
