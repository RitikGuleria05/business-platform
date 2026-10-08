namespace BusinessPlatform.Application.DTOs.Reports
{
    public class CustomerReportItemResponse
    {
        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public int TotalOrders { get; set; }

        public decimal TotalPurchase { get; set; }

        public decimal TotalReturns { get; set; }

        public decimal NetPurchase { get; set; }

        public decimal AverageOrderValue { get; set; }

        public DateTime? LastPurchaseDate { get; set; }
    }
}
