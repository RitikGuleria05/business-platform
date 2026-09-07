using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.ToTable("Customers");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.LastName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Email)
                .HasMaxLength(255);

            builder.HasIndex(x => x.Email)
                .IsUnique();

            builder.Property(x => x.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasIndex(x => x.PhoneNumber)
                .IsUnique();

            builder.Property(x => x.Address)
                .HasMaxLength(500);

            builder.Property(x => x.City)
                .HasMaxLength(100);

            builder.Property(x => x.State)
                .HasMaxLength(100);

            builder.Property(x => x.PostalCode)
                .HasMaxLength(20);

            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt);

            builder.Property(x => x.CreatedBy);

            builder.Property(x => x.UpdatedBy);

            // Uncomment after Sale module is created
            /*
            builder.HasMany(x => x.Sales)
                .WithOne(x => x.Customer)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            */
        }
    }
}
