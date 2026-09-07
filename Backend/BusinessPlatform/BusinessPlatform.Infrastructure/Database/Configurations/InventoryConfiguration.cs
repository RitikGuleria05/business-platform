using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    // used for databas configrations
    public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
    {
        public void Configure(EntityTypeBuilder<Inventory> builder)
        {
            builder.ToTable("Inventories");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.QuantityInStock)
                .HasDefaultValue(0);

            builder.Property(x => x.MinimumStock)
                .HasDefaultValue(0);

            builder.Property(x => x.MaximumStock)
                .HasDefaultValue(0);

            builder.Property(x => x.ReorderLevel)
                .HasDefaultValue(0);

            builder.Property(x => x.UpdatedAt)
                .IsRequired();

            builder.HasIndex(x => x.ProductId)
                .IsUnique();
        }
    }
}
