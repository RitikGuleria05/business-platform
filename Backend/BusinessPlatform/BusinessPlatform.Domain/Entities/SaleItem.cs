namespace BusinessPlatform.Domain.Entities
{
    public class SaleItem
    {
        public Guid Id { get; set; }

        public Guid SaleId { get; set; }

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Discount { get; set; }

        public decimal Tax { get; set; }

        public decimal Total { get; set; }

        // Navigation

        public Sale Sale { get; set; } = null!;

        public Product Product { get; set; } = null!;
    }
}
