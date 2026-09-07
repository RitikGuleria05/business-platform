using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class SaleReturnConfiguration : IEntityTypeConfiguration<SaleReturn>
    {
        public void Configure(
            EntityTypeBuilder<SaleReturn> builder)
        {
            builder.ToTable("SaleReturns");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ReturnNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.ReturnNumber)
                .IsUnique();

            builder.Property(x => x.TotalAmount)
                .HasPrecision(18, 2);

            builder.Property(x => x.Reason)
                .HasMaxLength(500);

            builder.HasOne(x => x.Sale)
                .WithMany()
                .HasForeignKey(x => x.SaleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Items)
                .WithOne(x => x.SaleReturn)
                .HasForeignKey(x => x.SaleReturnId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
