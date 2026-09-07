namespace BusinessPlatform.Application.DTOs.Reports
{
    public class DashboardSummaryResponse
    {
        public int TotalOrders { get; set; }

        public decimal TotalRevenue { get; set; }

        public int TotalCustomers { get; set; }

        public int TotalProducts { get; set; }

        public int LowStockProducts { get; set; }

        public int OutOfStockProducts { get; set; }
    }
}
