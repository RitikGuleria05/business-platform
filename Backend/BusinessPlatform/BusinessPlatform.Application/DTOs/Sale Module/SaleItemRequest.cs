namespace BusinessPlatform.Application.DTOs.Sale_Module
{
    public class SaleItemRequest
    {
        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal Discount { get; set; }
    }
}
