namespace BusinessPlatform.Application.DTOs.Reports
{
    public class CustomerReportResponse
    {
        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public int TotalCustomers { get; set; }

        public decimal TotalSales { get; set; }

        public decimal TotalReturns { get; set; }

        public decimal NetSales { get; set; }

        public List<CustomerReportItemResponse> Customers { get; set; } = [];
    }
}
