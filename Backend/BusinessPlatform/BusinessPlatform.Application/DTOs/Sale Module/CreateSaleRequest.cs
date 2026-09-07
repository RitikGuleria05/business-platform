namespace BusinessPlatform.Application.DTOs.Sale_Module
{
    public class CreateSaleRequest
    {
        public Guid CustomerId { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public string? Remarks { get; set; }

        public List<SaleItemRequest> Items { get; set; }
            = new();

        public List<PaymentRequest> Payments { get; set; }
            = new();
    }
}
