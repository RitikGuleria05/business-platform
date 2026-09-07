namespace BusinessPlatform.Application.DTOs.SaleReturn
{
    public class CreateSaleReturnItemRequest
    {
        public Guid ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
