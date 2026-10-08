namespace BusinessPlatform.Application.DTOs.Reports.Sales
{
    public class SalesReportResponse
    {
        public decimal GrossSales { get; set; }
        public decimal TotalReturns { get; set; }
        public decimal NetSales { get; set; }

        public int TotalOrders { get; set; }

        public decimal AverageOrderValue { get; set; }

        public List<SalesReportItemResponse> Sales { get; set; } = [];
    }
}
