using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Application.DTOs.Sale_Module
{
    public class PaymentResponse
    {
        public Guid Id { get; set; }

        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }

        public PaymentStatus Status { get; set; }

        public string? TransactionReference { get; set; }

        public DateTime PaymentDate { get; set; }
    }
}
