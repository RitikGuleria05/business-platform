using BusinessPlatform.Application.DTOs.Reports;

namespace BusinessPlatform.Application.Interfaces.Reports
{
    public interface IReportRepository
    {
        Task<DashboardSummaryResponse> GetDashboardSummaryAsync();

        Task<List<TopProductResponse>> GetTopProductsAsync(int count);

        Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from,DateTime to);
    }
}
