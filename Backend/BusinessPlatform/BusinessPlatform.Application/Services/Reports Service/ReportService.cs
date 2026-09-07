using BusinessPlatform.Application.DTOs.Reports;
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

        public async Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from, DateTime to)
        {
            if (from > to)
            {
                throw new BadRequestException("From date cannot be greater than To date.");
            }

            return await _reportRepository.GetSalesTrendAsync(from, to);
        }
    }
}
