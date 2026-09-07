namespace BusinessPlatform.Application.DTOs.Product
{
    public class CreateProductRequest
    {
        // Product
        public string Name { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string? Barcode { get; set; }

        public string? Description { get; set; }

        public Guid CategoryId { get; set; }

        // Pricing
        public decimal CostPrice { get; set; }

        public decimal SellingPrice { get; set; }

        // Inventory
        public int InitialStock { get; set; }

        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }

        public int ReorderLevel { get; set; }
    }
}
