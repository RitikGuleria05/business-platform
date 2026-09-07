using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Application.DTOs.Sale_Module
{
    public class PaymentRequest
    {
        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }

        public string? TransactionReference { get; set; }
    }
}
