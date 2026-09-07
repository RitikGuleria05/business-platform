namespace BusinessPlatform.Domain.Entities
{
    public class Inventory
    {

        public Guid Id { get; set; }
        public Guid ProductId { get; set; }

        public int QuantityInStock { get; set; }

        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }
        public int ReorderLevel { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? UpdatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation Property
        public Product Product { get; set; } = null!;
    }
}
