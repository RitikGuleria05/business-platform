namespace BusinessPlatform.Application.DTOs.SaleReturn
{
    public class CreateSaleReturnRequest
    {
        public Guid SaleId { get; set; }

        public string? Reason { get; set; }

        public List<CreateSaleReturnItemRequest> Items { get; set; } = new();
    }
}
