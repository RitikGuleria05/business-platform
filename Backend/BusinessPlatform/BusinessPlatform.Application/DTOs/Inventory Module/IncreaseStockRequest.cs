namespace BusinessPlatform.Application.DTOs.Inventory_Module
{
    public class IncreaseStockRequest
    {
        public Guid ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
