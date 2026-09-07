using System.Runtime.Intrinsics.X86;

namespace BusinessPlatform.Domain.Entities
{
    public class SaleReturnItem
    {
        public Guid Id { get; set; }

        public Guid SaleReturnId { get; set; }

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }
//        instead of reading the current Product price.
//        That's important.
//        If the product was sold at ₹1,000 and later its price becomes ₹1,200, the return should still use the          original sale price.

        public decimal Total { get; set; }

        // Navigation

        public SaleReturn SaleReturn { get; set; } = null!;

        public Product Product { get; set; } = null!;
    }
}
