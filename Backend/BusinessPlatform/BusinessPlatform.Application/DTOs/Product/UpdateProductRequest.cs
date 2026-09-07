namespace BusinessPlatform.Application.DTOs.Product
{
    public class UpdateProductRequest
    {
        public string Name { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public string? Barcode { get; set; }

        public string? Description { get; set; }

        public Guid CategoryId { get; set; }

        public decimal CostPrice { get; set; }

        public decimal SellingPrice { get; set; }

        public bool IsActive { get; set; }
    }
}
