using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Application.DTOs.SaleReturn
{
    public class SaleReturnResponse
    {
        public Guid Id { get; set; }

        public Guid SaleId { get; set; }

        public string ReturnNumber { get; set; } = string.Empty;

        public DateTime ReturnDate { get; set; }

        public decimal TotalAmount { get; set; }

        public ReturnStatus Status { get; set; }

        public string? Reason { get; set; }

        public List<SaleReturnItemResponse> Items { get; set; } = new();
    }
}
