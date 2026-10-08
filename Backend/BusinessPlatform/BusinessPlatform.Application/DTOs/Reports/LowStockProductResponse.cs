namespace BusinessPlatform.Application.DTOs.Reports
{
    public class LowStockProductResponse
    {
        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string CategoryName { get; set; } = string.Empty;

        public int CurrentStock { get; set; }

        public int ReorderLevel { get; set; }

        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }

        public string StockStatus { get; set; } = string.Empty;
    }
}
