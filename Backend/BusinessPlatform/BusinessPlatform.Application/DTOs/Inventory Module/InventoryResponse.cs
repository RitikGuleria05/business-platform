namespace BusinessPlatform.Application.DTOs.Inventory_Module
{
    public class InventoryResponse
    {
        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public int QuantityInStock { get; set; }

        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }

        public int ReorderLevel { get; set; }

        public DateTime? LastUpdated { get; set; }
    }
}
