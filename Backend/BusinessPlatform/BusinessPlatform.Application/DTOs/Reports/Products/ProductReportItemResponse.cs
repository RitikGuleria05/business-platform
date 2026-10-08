namespace BusinessPlatform.Application.DTOs.Reports.Products
{
    public class ProductReportItemResponse
    {
        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string CategoryName { get; set; } = string.Empty;

        public int CurrentStock { get; set; }

        public int QuantitySold { get; set; }

        public decimal GrossRevenue { get; set; }

        public int QuantityReturned { get; set; }

        public decimal ReturnAmount { get; set; }

        public int NetQuantitySold { get; set; }

        public decimal NetRevenue { get; set; }
    }
}
