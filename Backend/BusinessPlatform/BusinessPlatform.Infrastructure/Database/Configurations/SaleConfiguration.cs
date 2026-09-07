using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class SaleConfiguration : IEntityTypeConfiguration<Sale>
    {
        public void Configure(EntityTypeBuilder<Sale> builder)
        {
            builder.ToTable("Sales");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.InvoiceNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.InvoiceNumber)
                .IsUnique();

            builder.Property(x => x.SubTotal)
                .HasPrecision(18, 2);

            builder.Property(x => x.Discount)
                .HasPrecision(18, 2);

            builder.Property(x => x.Tax)
                .HasPrecision(18, 2);

            builder.Property(x => x.GrandTotal)
                .HasPrecision(18, 2);

            builder.Property(x => x.PaymentStatus)
                .HasConversion<int>();

            builder.Property(x => x.Remarks)
                .HasMaxLength(500);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.HasOne(x => x.Customer)
                .WithMany(x => x.Sales)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
