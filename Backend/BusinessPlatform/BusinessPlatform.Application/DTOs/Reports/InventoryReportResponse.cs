namespace BusinessPlatform.Application.DTOs.Reports
{
    public class InventoryReportResponse
    {
        public int TotalProducts { get; set; }

        public int InStockProducts { get; set; }

        public int LowStockProducts { get; set; }

        public int OutOfStockProducts { get; set; }

        public decimal TotalStockValue { get; set; }

        public List<InventoryReportItemResponse> Products { get; set; } = [];
    }
}
