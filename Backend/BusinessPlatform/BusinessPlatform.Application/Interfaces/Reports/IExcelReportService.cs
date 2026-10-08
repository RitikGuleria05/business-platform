namespace BusinessPlatform.Application.Interfaces.Reports
{
    public interface IExcelReportService
    {
        Task<byte[]> GenerateSalesReportAsync(DateTime from,DateTime to);

        Task<byte[]> GenerateProductReportAsync(DateTime from, DateTime to);

        Task<byte[]> GenerateInventoryReportAsync();

        Task<byte[]> GenerateCustomerReportAsync(DateTime from, DateTime to);
    }
}
