namespace BusinessPlatform.Application.DTOs.Reports
{
    public class DashboardSummaryResponse
    {
        public decimal TodaySales { get; set; }

        public int TodayOrders { get; set; }

        public decimal TodayReturns { get; set; }

        public int TotalCustomers { get; set; }

        public int TotalProducts { get; set; }

        public int LowStockProducts { get; set; }

        public int OutOfStockProducts { get; set; }
    }
}
