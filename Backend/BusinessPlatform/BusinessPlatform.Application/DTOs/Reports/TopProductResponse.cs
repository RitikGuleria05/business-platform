namespace BusinessPlatform.Application.DTOs.Reports
{
    public class TopProductResponse
    {
        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int QuantitySold { get; set; }

        public decimal Revenue { get; set; }
    }
}
