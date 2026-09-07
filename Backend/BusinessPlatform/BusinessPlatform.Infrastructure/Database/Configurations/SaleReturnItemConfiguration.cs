using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class SaleReturnItemConfiguration : IEntityTypeConfiguration<SaleReturnItem>
    {
        public void Configure(
            EntityTypeBuilder<SaleReturnItem> builder)
        {
            builder.ToTable("SaleReturnItems");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UnitPrice)
                .HasPrecision(18, 2);

            builder.Property(x => x.Total)
                .HasPrecision(18, 2);

            builder.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
