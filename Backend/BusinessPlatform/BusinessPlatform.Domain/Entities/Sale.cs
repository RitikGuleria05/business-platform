using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Domain.Entities
{
    public class Sale
    {
        public Guid Id { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public Guid CustomerId { get; set; }

        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        public decimal SubTotal { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public decimal GrandTotal { get; set; }

        public PaymentStatus PaymentStatus { get; set; }
            = PaymentStatus.Pending;

        public SaleStatus Status { get; set; }
            = SaleStatus.Completed;

        public string? Remarks { get; set; }

        public Guid? CreatedBy { get; set; }

        public Guid? UpdatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation

        public Customer Customer { get; set; } = null!;

        public ICollection<SaleItem> SaleItems { get; set; }
            = new List<SaleItem>();

        public ICollection<Payment> Payments { get; set; }
            = new List<Payment>();
    }
}
