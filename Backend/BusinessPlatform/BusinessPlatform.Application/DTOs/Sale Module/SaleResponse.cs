using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Application.DTOs.Sale_Module
{
    public class SaleResponse
    {
        public Guid Id { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public DateTime SaleDate { get; set; }

        public decimal SubTotal { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public decimal GrandTotal { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public SaleStatus Status { get; set; }

        public string? Remarks { get; set; }

        public List<SaleItemResponse> Items { get; set; }
            = new();

        public List<PaymentResponse> Payments { get; set; }
            = new();
    }
}
