using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }

        public Guid SaleId { get; set; }

        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }

        public PaymentStatus Status { get; set; }

        public string? TransactionReference { get; set; }

        public DateTime PaymentDate { get; set; }
            = DateTime.UtcNow;

        // Navigation

        public Sale Sale { get; set; } = null!;
    }
}
