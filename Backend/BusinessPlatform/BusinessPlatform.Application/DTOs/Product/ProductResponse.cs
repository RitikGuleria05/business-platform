namespace BusinessPlatform.Application.DTOs.Product
{
    public class ProductResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string? Barcode { get; set; }

        public Guid CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public decimal CostPrice { get; set; }

        public decimal SellingPrice { get; set; }

        public bool IsActive { get; set; }

        // Inventory
        public int QuantityInStock { get; set; }

        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }

        public int ReorderLevel { get; set; }
    }
}
