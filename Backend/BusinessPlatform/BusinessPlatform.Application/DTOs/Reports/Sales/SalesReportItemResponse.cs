namespace BusinessPlatform.Application.DTOs.Reports.Sales
{
    public class SalesReportItemResponse
    {
        public Guid SaleId { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime SaleDate { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public decimal SubTotal { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public decimal GrandTotal { get; set; }

        public string PaymentStatus { get; set; } = string.Empty;
    }
}
