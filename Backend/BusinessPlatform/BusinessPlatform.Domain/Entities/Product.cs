namespace BusinessPlatform.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string? Barcode { get; set; }

        public string? Description { get; set; }

        public Guid CategoryId { get; set; }

        public decimal CostPrice { get; set; }

        public decimal SellingPrice { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? UpdatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation Property
        public Category Category { get; set; } = null!;

        public Inventory? Inventory { get; set; }

        public ICollection<SaleItem> SaleItems { get; set; }
            = new List<SaleItem>(); 
    }
}
