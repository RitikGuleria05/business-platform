using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Amount)
                .HasPrecision(18, 2);

            builder.Property(x => x.Method)
                .HasConversion<int>();

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.TransactionReference)
                .HasMaxLength(150);

            builder.HasOne(x => x.Sale)
                .WithMany(x => x.Payments)
                .HasForeignKey(x => x.SaleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
