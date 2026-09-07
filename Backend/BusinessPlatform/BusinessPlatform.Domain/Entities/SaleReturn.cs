using BusinessPlatform.Domain.Enums;

namespace BusinessPlatform.Domain.Entities
{
    public class SaleReturn
    {
        public Guid Id { get; set; }

        public Guid SaleId { get; set; }

        public string ReturnNumber { get; set; } = string.Empty;

        public DateTime ReturnDate { get; set; }
            = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        public ReturnStatus Status { get; set; }
            = ReturnStatus.Completed;

        public string? Reason { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        // Navigation

        public Sale Sale { get; set; } = null!;

        public ICollection<SaleReturnItem> Items { get; set; }
            = new List<SaleReturnItem>();
    }
}
