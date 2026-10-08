using BusinessPlatform.Application.DTOs.Reports;
using BusinessPlatform.Application.DTOs.Reports.Products;
using BusinessPlatform.Application.DTOs.Reports.Sales;

namespace BusinessPlatform.Application.Interfaces.Reports
{
    public interface IReportRepository
    {
        Task<DashboardSummaryResponse> GetDashboardSummaryAsync();

        Task<List<TopProductResponse>> GetTopProductsAsync(int count);

        Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from,DateTime to);
        Task<SalesReportResponse> GetSalesReportAsync(DateTime from,DateTime to);
        Task<ProductReportResponse> GetProductReportAsync(DateTime from, DateTime to);
        Task<InventoryReportResponse> GetInventoryReportAsync();

        Task<List<LowStockProductResponse>> GetLowStockProductsAsync();
        Task<CustomerReportResponse> GetCustomerReportAsync(DateTime from,DateTime to);
    }
}
