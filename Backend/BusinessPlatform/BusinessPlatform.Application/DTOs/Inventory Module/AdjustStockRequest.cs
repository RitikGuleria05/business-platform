namespace BusinessPlatform.Application.DTOs.Inventory_Module
{
    public class AdjustStockRequest
    {
        public Guid ProductId { get; set; }

        public int NewQuantity { get; set; }

        public string? Reason { get; set; }
    }
}
