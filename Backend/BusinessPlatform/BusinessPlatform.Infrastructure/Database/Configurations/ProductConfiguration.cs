using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.SKU)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.SKU)
                .IsUnique();

            builder.Property(x => x.Barcode)
                .HasMaxLength(100);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.CostPrice)
                .HasPrecision(18, 2);

            builder.Property(x => x.SellingPrice)
                .HasPrecision(18, 2);

            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt);

            builder.HasOne(x => x.Inventory)
                .WithOne(x => x.Product)
                .HasForeignKey<Inventory>(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
