namespace BusinessPlatform.Application.DTOs.Inventory_Module
{
    public class UpdateInventoryRequest
    {
        public int MinimumStock { get; set; }

        public int MaximumStock { get; set; }

        public int ReorderLevel { get; set; }
    }
}
